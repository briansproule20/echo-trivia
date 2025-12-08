// Generate trivia questions using Echo LLM with recipe system

import { anthropic } from "@/echo";
import { generateText } from "ai";
import { PlaySettingsSchema, QuizSchema } from "@/lib/schemas";
import { generateId, shuffleChoices, getDailySeed, hashString } from "@/lib/quiz-utils";
import { NextResponse } from "next/server";
import { generateSeed } from "@/lib/rand";
import { buildRecipeFromSeed, DIFFICULTY_CURVES, Labels, categoryEnumToString, categoryStringToEnum } from "@/lib/recipe";
import { createServiceClient } from "@/utils/supabase/service";
import type { Quiz, Question } from "@/lib/types";

// Type for answer key storage
interface AnswerKey {
  question_id: string;
  answer: string;
  type: string;
  explanation: string;
}

// Strip answers from quiz before sending to client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripAnswersFromQuiz(quiz: any): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    createdAt: quiz.createdAt,
    seeded: quiz.seeded,
    questions: quiz.questions.map((q: Question) => ({
      ...q,
      answer: "", // Remove answer
      explanation: "", // Remove explanation until after answer is submitted
    })),
  };
}

// Store answer keys server-side
async function storeAnswerKeys(quizId: string, questions: Question[]): Promise<void> {
  const supabase = createServiceClient();

  const answerKeys: AnswerKey[] = questions.map((q) => ({
    question_id: q.id,
    answer: q.answer,
    type: q.type,
    explanation: q.explanation || "",
  }));

  const { error } = await supabase
    .from("quiz_answer_keys")
    .upsert({
      quiz_id: quizId,
      answers: answerKeys,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }, {
      onConflict: "quiz_id",
    });

  if (error) {
    console.error("Failed to store answer keys:", error);
    throw new Error("Failed to securely store quiz answers");
  }
}

const GENERATION_SYSTEM_PROMPT = `You are a professional trivia author. Produce high-quality, factual, diverse questions.

Rules:
- Adhere strictly to the JSON schema provided.
- Categories: History, Science, Literature, Film & TV, Sports, Geography, Arts, Technology, General Knowledge, Music, Food & Drink, Nature & Animals, Mythology, Space & Astronomy, Video Games, Politics & Government, Business & Economics, Health & Medicine, Architecture, Fashion
- IMPORTANT: Use the EXACT category name provided in the user prompt. Do NOT change or normalize category names.
- Question types: multiple_choice | true_false | short_answer.
- Difficulty: easy | medium | hard. Mix when requested.
- Multiple choice MUST have exactly 4 options with IDs: A, B, C, D (in that order). Exactly one correct.
- The choices array must contain exactly 4 objects in order: [{"id":"A","text":"..."}, {"id":"B","text":"..."}, {"id":"C","text":"..."}, {"id":"D","text":"..."}]
- Include a concise explanation for each question (1-2 sentences), unless trivially obvious.
- Avoid ambiguous or opinion-based items. No spoilers for very recent media without warning.
- Prefer global representation (countries/authors/eras).
- Use clear phrasing; avoid double negatives.
- NEVER include the answer within the question prompt itself. BAD: "What world wonder was located in Alexandria: The Lighthouse of Alexandria?" GOOD: "Which ancient wonder was located in Alexandria, Egypt?"
- For multiple choice, the "answer" field should be the choice ID (A, B, C, or D).
- For true/false, the "answer" field should be "true" or "false".
- For short answer, the "answer" field should be the expected text answer.

CRITICAL - Fair and Clear Questions:
- NEVER create trick questions or questions designed to deceive the user.
- Avoid confusingly similar dates or numbers in multiple choice options (e.g., don't use 1492, 1493, 1494, 1495 as options).
- Wrong answers should be plausible but distinctly different from the correct answer.
- Focus on testing knowledge, NOT testing the user's ability to spot subtle differences.
- Make wrong answers clearly wrong to someone who knows the topic, but reasonable to someone who doesn't.
- Prioritize clarity and educational value over difficulty through confusion.

CRITICAL - Variety & Freshness:
- EASY questions: Should be accessible but NOT obvious or trivial. Avoid the most famous/clichéd facts everyone knows (e.g., "What is the capital of France?"). Instead, use interesting-but-approachable facts that are educational and make people think. Easy should mean "solvable with basic knowledge" not "everyone already knows this."
- MEDIUM questions: Should explore more specific topics. Avoid the most overused facts. Use interesting angles.
- HARD questions: Must be unique and challenging. Dig deep into lesser-known facts, surprising connections, or edge cases.
- Explore diverse subtopics within each category. Don't recycle the same angles or famous examples repeatedly.
- For each quiz, vary time periods, people, events, or concepts.
- Avoid patterns like "always asking about the same wars, same scientists, same books, same movies."
- Each quiz should feel distinct from previous quizzes at ALL difficulty levels.
- NEVER repeat the same question or extremely similar variations across different generations.

Output: valid JSON ONLY matching the schema.`;

const SCHEMA_TEMPLATE = `{
  "title": "string",
  "description": "string",
  "category": "string",
  "questions": [
    {
      "id": "string (generate unique IDs)",
      "type": "multiple_choice | true_false | short_answer",
      "difficulty": "easy | medium | hard",
      "category": "string",
      "prompt": "string",
      "choices": [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],
      "answer": "string (A, B, C, or D for MCQ, 'true'/'false' for T/F, text for short answer)",
      "explanation": "string"
    }
  ]
}`;

// Simple non-seeded generation for custom categories
async function generateCustomCategoryQuiz(settings: any, preferredTone?: string, explanationStyle?: string) {
  try {
    const typeInstruction =
      settings.type === "mixed"
        ? "Mix of multiple choice, true/false, and short answer questions"
        : settings.type === "multiple_choice"
        ? "All questions should be multiple choice with EXACTLY 4 options (A, B, C, D)"
        : settings.type === "true_false"
        ? "All questions should be true/false"
        : "All questions should be short answer";

    const difficultyInstruction =
      settings.difficulty === "mixed"
        ? "Mix easy, medium, and hard questions"
        : `All questions should be ${settings.difficulty} difficulty`;

    // Build tone and style instructions if preferences are set
    const toneInstruction = preferredTone ? `- Apply a "${preferredTone}" tone throughout` : '';
    const styleInstruction = explanationStyle ? `- Write explanations in the "${explanationStyle}" style` : '';

    const prompt = `Generate ${settings.numQuestions} trivia questions about ${settings.category}.

${typeInstruction}.
${difficultyInstruction}.

CRITICAL: The "category" field in your response MUST be EXACTLY: "${settings.category}"
Do NOT change, normalize, or abbreviate the category name.

INSTRUCTIONS:
- Create ${settings.numQuestions} diverse, interesting questions
- For multiple_choice, include exactly 4 options with exactly 1 correct
- EASY questions: accessible but NOT trivial - avoid overly famous facts
- MEDIUM questions: more specific topics and interesting angles
- HARD questions: unique and challenging with lesser-known facts
- Include concise explanations (1-2 sentences) for each question
- Make each question feel distinct and original
${toneInstruction}
${styleInstruction}

Return ONLY valid JSON matching this schema:
${SCHEMA_TEMPLATE}

Make the quiz engaging and educational. Ensure all questions are factually accurate.`;

    // Generate without recipe system
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: GENERATION_SYSTEM_PROMPT,
      prompt,
      temperature: 1.0, // Higher temperature for more variety in custom quizzes
    });

    // Parse and validate response
    let quiz;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      quiz = QuizSchema.parse({
        ...parsed,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      // Try to repair JSON with LLM
      console.error("JSON parsing failed, attempting repair:", error);

      const repairResult = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: "You fix invalid JSON to match a schema. Return ONLY the corrected JSON.",
        prompt: `Fix this JSON to match the schema:\n\nInvalid JSON:\n${result.text}\n\nRequired Schema:\n${SCHEMA_TEMPLATE}`,
      });

      const repairedJson = repairResult.text.match(/\{[\s\S]*\}/)?.[0];
      if (!repairedJson) {
        throw new Error("Failed to repair JSON");
      }

      const parsed = JSON.parse(repairedJson);
      quiz = QuizSchema.parse({
        ...parsed,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    }

    // Ensure choices are in A, B, C, D order
    quiz.questions = quiz.questions.map((q) => {
      if (q.type === "multiple_choice" && q.choices) {
        const sortedChoices = [...q.choices].sort((a, b) => a.id.localeCompare(b.id));

        if (sortedChoices.length !== 4) {
          console.warn(`Question ${q.id} has ${sortedChoices.length} choices, expected 4`);
        }

        return {
          ...q,
          choices: sortedChoices,
        };
      }
      return q;
    });

    // Force the category to match exactly what was requested
    quiz.category = settings.category;
    quiz.questions = quiz.questions.map((q) => ({
      ...q,
      category: settings.category,
    }));

    // SECURITY: Store answers server-side and strip from client response
    // quiz.id is always set by generateId() above
    await storeAnswerKeys(quiz.id!, quiz.questions);
    const clientQuiz = stripAnswersFromQuiz(quiz);

    return NextResponse.json(clientQuiz);
  } catch (error) {
    console.error("Generate custom category quiz error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = PlaySettingsSchema.parse(body.settings);
    const { dailyDate, preferredTone, explanationStyle } = body; // Optional: for daily quizzes and user preferences

    // Map category string to enum (if it exists in our predefined categories)
    const categoryEnum = categoryStringToEnum(settings.category);
    const isCustomCategory = categoryEnum === undefined;

    // For custom categories: skip recipe system and use simple generation
    if (isCustomCategory && !dailyDate) {
      return generateCustomCategoryQuiz(settings, preferredTone, explanationStyle);
    }

    // For daily quizzes and established categories: use seeded recipe system
    // Generate deterministic seed
    let seedHex: string;
    if (dailyDate) {
      // For daily quizzes: deterministic seed based on date + category
      const dailyHash = hashString(`${dailyDate}-${settings.category}`);
      seedHex = dailyHash.toString(16).padStart(64, '0').slice(0, 64);
    } else {
      // For freeplay quizzes with established categories: random seed
      seedHex = generateSeed();
    }

    // Build recipe from seed
    const recipe = buildRecipeFromSeed(seedHex, {
      fixedNumQuestions: settings.numQuestions === 5 ? 5 : 10,
    });
    console.log('Generated recipe:', JSON.stringify(recipe, null, 2));
    console.log('Using seed:', seedHex.slice(0, 16) + '...');

    // Use the specified category as primary category
    if (categoryEnum === undefined) {
      throw new Error('Category enum is required for established categories');
    }
    const primaryCategory = categoryEnumToString(categoryEnum);

    // Get categories to include in the quiz (only the specified category)
    const categoryStrings = [primaryCategory];

    // Get the difficulty curve for this recipe
    const curve = DIFFICULTY_CURVES[recipe.difficultyCurveId].slice(0, recipe.numQuestions);

    // Convert difficulty curve values to difficulty labels based on user's preference
    const difficultyLabels = curve.map(val => {
      if (settings.difficulty !== "mixed") {
        return settings.difficulty; // Respect user's difficulty choice
      }
      // Use curve for mixed difficulty
      if (val < 0.4) return "easy";
      if (val < 0.7) return "medium";
      return "hard";
    });

    // Build generation prompt using recipe
    const typeInstruction =
      settings.type === "mixed"
        ? "Mix of multiple choice, true/false, and short answer questions"
        : settings.type === "multiple_choice"
        ? "All questions should be multiple choice with EXACTLY 4 options (A, B, C, D)"
        : settings.type === "true_false"
        ? "All questions should be true/false"
        : "All questions should be short answer";

    // Helper to convert enum arrays to label arrays
    const toLabel = (arr: number[], labels: readonly string[]) => arr.map(i => labels[i]);

    // Use user preferences if provided, otherwise fall back to recipe
    const finalTone = preferredTone || Labels.Tone[recipe.tone];
    const finalExplanationStyle = explanationStyle || Labels.ExplanationStyle[recipe.explanation];

    const prompt = `Generate ${recipe.numQuestions} trivia questions about ${primaryCategory}.

RECIPE CONSTRAINTS:
- tone: ${finalTone}
- era: ${Labels.Era[recipe.era]}
- explanation_style: ${finalExplanationStyle}

${typeInstruction}.

CRITICAL: The "category" field in your response MUST be EXACTLY: "${primaryCategory}"
Do NOT change, normalize, or abbreviate the category name. Use it character-for-character as provided.

DIFFICULTY ASSIGNMENT (CRITICAL):
You must generate EXACTLY ${recipe.numQuestions} questions with the following difficulty for each question IN ORDER:
${difficultyLabels.map((d, i) => `Question ${i + 1}: difficulty="${d}"`).join('\n')}

INSTRUCTIONS:
- Create ${recipe.numQuestions} questions matching the recipe
- CRITICAL: Set the "difficulty" field for each question EXACTLY as specified above (question 1 = "${difficultyLabels[0]}", question 2 = "${difficultyLabels[1]}", etc.)
- For multiple_choice, include exactly 4 options with exactly 1 correct
- For wrong answer choices: make them plausible but clearly distinct from the correct answer (avoid trick questions and confusingly similar options)
- Write explanations in the "${finalExplanationStyle}" style
- Apply the "${finalTone}" tone throughout
- Focus on the "${Labels.Era[recipe.era]}" era when relevant
- EASY questions: Should be accessible but NOT obvious or trivial - avoid the most famous facts everyone already knows
- MEDIUM questions: Should explore more specific topics and interesting angles
- HARD questions: Must be unique and challenging with lesser-known facts
- Make this quiz feel distinct and original. NEVER reuse the same questions or extremely similar variations

Generation Seed: ${seedHex.slice(0, 8)}...

Return ONLY valid JSON matching this schema:
${SCHEMA_TEMPLATE}

Make the quiz engaging and educational. Ensure all questions are factually accurate.`;

    // Generate with Echo LLM with higher temperature for variety
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: GENERATION_SYSTEM_PROMPT,
      prompt,
      temperature: 1.0, // Higher temperature for more variety in freeplay quizzes
    });

    // Parse and validate response
    let quiz;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      quiz = QuizSchema.parse({
        ...parsed,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      // Try to repair JSON with LLM
      console.error("JSON parsing failed, attempting repair:", error);
      
      const repairResult = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: "You fix invalid JSON to match a schema. Return ONLY the corrected JSON.",
        prompt: `Fix this JSON to match the schema:\n\nInvalid JSON:\n${result.text}\n\nRequired Schema:\n${SCHEMA_TEMPLATE}`,
      });

      const repairedJson = repairResult.text.match(/\{[\s\S]*\}/)?.[0];
      if (!repairedJson) {
        throw new Error("Failed to repair JSON");
      }
      
      const parsed = JSON.parse(repairedJson);
      quiz = QuizSchema.parse({
        ...parsed,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    }

    // Ensure choices are in A, B, C, D order and normalize format
    quiz.questions = quiz.questions.map((q) => {
      if (q.type === "multiple_choice" && q.choices) {
        // Sort choices by ID to ensure A, B, C, D order
        const sortedChoices = [...q.choices].sort((a, b) => a.id.localeCompare(b.id));

        // If we don't have exactly 4 choices, something went wrong
        if (sortedChoices.length !== 4) {
          console.warn(`Question ${q.id} has ${sortedChoices.length} choices, expected 4`);
        }

        return {
          ...q,
          choices: sortedChoices,
        };
      }
      return q;
    });

    // CRITICAL: Force the category to match exactly what was requested
    // The LLM sometimes normalizes categories (e.g., "Space & Astronomy" -> "Science")
    // This ensures the share message shows the exact daily challenge category
    quiz.category = settings.category;
    quiz.questions = quiz.questions.map((q) => ({
      ...q,
      category: settings.category,
    }));

    // SECURITY: Store answers server-side and strip from client response
    // quiz.id is always set by generateId() above
    await storeAnswerKeys(quiz.id!, quiz.questions);
    const clientQuiz = stripAnswersFromQuiz(quiz);

    return NextResponse.json(clientQuiz);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

