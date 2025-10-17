// Generate trivia questions using Echo LLM with recipe system

import { anthropic } from "@/echo";
import { generateText } from "ai";
import { PlaySettingsSchema, QuizSchema } from "@/lib/schemas";
import { generateId, shuffleChoices, getDailySeed, hashString } from "@/lib/quiz-utils";
import { NextResponse } from "next/server";
import { generateSeed } from "@/lib/rand";
import { buildRecipeFromSeed, DIFFICULTY_CURVES, Labels, categoryEnumToString, categoryStringToEnum } from "@/lib/recipe";

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

CRITICAL - Variety & Freshness:
- EASY questions: Should be accessible but NOT obvious or trivial. Avoid the most famous/clichéd facts everyone knows (e.g., "What is the capital of France?"). Instead, use interesting-but-approachable facts that are educational and make people think. Easy should mean "solvable with basic knowledge" not "everyone already knows this."
- MEDIUM questions: Should explore more specific topics. Avoid the most overused facts. Use interesting angles.
- HARD questions: Must be unique and challenging. Dig deep into lesser-known facts, surprising connections, or edge cases.
- Explore diverse subtopics within each category. Don't recycle the same angles or famous examples repeatedly.
- For each quiz, vary time periods, regions, people, events, or concepts.
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = PlaySettingsSchema.parse(body.settings);
    const { dailyDate } = body; // Optional: for daily quizzes

    // Generate deterministic seed
    let seedHex: string;
    if (dailyDate) {
      // For daily quizzes: deterministic seed based on date + category
      const dailyHash = hashString(`${dailyDate}-${settings.category}`);
      seedHex = dailyHash.toString(16).padStart(64, '0').slice(0, 64);
    } else {
      // For practice quizzes: random seed
      seedHex = generateSeed();
    }

    // Map category string to enum (if it exists in our predefined categories)
    const categoryEnum = categoryStringToEnum(settings.category);

    // Build recipe from seed
    const recipe = buildRecipeFromSeed(seedHex, {
      fixedNumQuestions: settings.numQuestions === 5 ? 5 : 10,
    });

    // If user specified a category that's in our enum, use it as primary category
    // Otherwise, use the first category from the recipe mix
    const primaryCategory = categoryEnum !== undefined
      ? categoryEnumToString(categoryEnum)
      : settings.category; // Use custom category as-is

    // Get categories to include in the quiz
    const categoryStrings = categoryEnum !== undefined
      ? [primaryCategory] // Use only the specified category for focused quizzes
      : recipe.categoryMix.map(cat => categoryEnumToString(cat)); // Use recipe mix for variety

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

    const prompt = `Generate ${recipe.numQuestions} trivia questions about ${primaryCategory}.

RECIPE CONSTRAINTS:
- tone: ${Labels.Tone[recipe.tone]}
- era: ${Labels.Era[recipe.era]}
- region: ${Labels.Region[recipe.region]}
- distractor_styles: ${toLabel(recipe.distractors as unknown as number[], Labels.DistractorStyle).join(", ")}
- explanation_style: ${Labels.ExplanationStyle[recipe.explanation]}

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
- Use distractor styles: ${toLabel(recipe.distractors as unknown as number[], Labels.DistractorStyle).join(", ")}
- Write explanations in the "${Labels.ExplanationStyle[recipe.explanation]}" style
- Apply the "${Labels.Tone[recipe.tone]}" tone throughout
- Focus on the "${Labels.Era[recipe.era]}" era and "${Labels.Region[recipe.region]}" region when relevant
- EASY questions: Should be accessible but NOT obvious or trivial - avoid the most famous facts everyone already knows
- MEDIUM questions: Should explore more specific topics and interesting angles
- HARD questions: Must be unique and challenging with lesser-known facts
- Make this quiz feel distinct and original. NEVER reuse the same questions or extremely similar variations

Generation Seed: ${seedHex.slice(0, 8)}...

Return ONLY valid JSON matching this schema:
${SCHEMA_TEMPLATE}

Make the quiz engaging and educational. Ensure all questions are factually accurate.`;

    // Generate with Echo LLM (keep existing temperature)
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: GENERATION_SYSTEM_PROMPT,
      prompt,
      temperature: 0.8,
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

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

