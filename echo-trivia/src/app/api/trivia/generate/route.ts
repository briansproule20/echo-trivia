// Generate trivia questions using Echo LLM

import { anthropic } from "@/echo";
import { generateText } from "ai";
import { PlaySettingsSchema, QuizSchema } from "@/lib/schemas";
import { generateId, shuffleChoices } from "@/lib/quiz-utils";
import { NextResponse } from "next/server";

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

    // Build generation prompt
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
        ? "Mix of easy, medium, and hard difficulty"
        : `All questions should be ${settings.difficulty} difficulty`;

    // Add timestamp to ensure each generation is unique
    const timestamp = Date.now();

    const prompt = `Generate ${settings.numQuestions} trivia questions about ${settings.category}.

${typeInstruction}.
${difficultyInstruction}.

CRITICAL: The "category" field in your response MUST be EXACTLY: "${settings.category}"
Do NOT change, normalize, or abbreviate the category name. Use it character-for-character as provided.

IMPORTANT: Easy questions should be accessible but NOT obvious or trivial - avoid the most famous facts everyone already knows. Medium and hard questions should be progressively more unique - avoid clichéd facts, explore interesting angles, lesser-known details, and diverse examples within this topic. For each quiz, pick different time periods, regions, people, events, or concepts. Make this quiz feel distinct and original. NEVER reuse the same questions or extremely similar variations.

Generation ID: ${timestamp}

Return ONLY valid JSON matching this schema:
${SCHEMA_TEMPLATE}

Make the quiz engaging and educational. Ensure all questions are factually accurate.`;

    // Generate with Echo LLM
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

