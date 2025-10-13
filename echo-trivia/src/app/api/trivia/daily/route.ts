// Daily quiz endpoint - deterministic quiz for a given date
// Generates once per day at midnight EST, caches for all users

import { NextResponse } from "next/server";
import { getTodayString, getDailySeed, SeededRandom } from "@/lib/quiz-utils";
import { CATEGORIES } from "@/lib/types";
import { openai } from "@/echo";
import { generateText } from "ai";
import { generateId, shuffleChoices } from "@/lib/quiz-utils";

const GENERATION_SYSTEM_PROMPT = `You are a professional trivia author. Produce high-quality, factual, diverse questions.

Rules:
- Adhere strictly to the JSON schema provided.
- Categories: History, Science, Literature, Film & TV, Sports, Geography, Arts, Technology, General Knowledge, or custom.
- Question types: multiple_choice | true_false | short_answer.
- Difficulty: easy | medium | hard. Mix when requested.
- Multiple choice must have 3-5 total options, exactly one correct.
- Include a concise explanation for each question (1-2 sentences), unless trivially obvious.
- Avoid ambiguous or opinion-based items. No spoilers for very recent media without warning.
- Prefer global representation (countries/authors/eras).
- Use clear phrasing; avoid double negatives.
- For multiple choice, the "answer" field should be the choice ID (A, B, C, D, etc).
- For true/false, the "answer" field should be "true" or "false".
- For short answer, the "answer" field should be the expected text answer.

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
      "choices": [{"id":"A","text":"..."},{"id":"B","text":"..."}],
      "answer": "string (choice id for MCQ, 'true'/'false' for T/F, text for short answer)",
      "explanation": "string"
    }
  ]
}`;

// In-memory cache for daily quiz (resets on server restart)
let dailyQuizCache: { date: string; quiz: any } | null = null;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayString();

    // Check cache first
    if (dailyQuizCache && dailyQuizCache.date === date) {
      console.log(`Serving cached daily quiz for ${date}`);
      return NextResponse.json(dailyQuizCache.quiz, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    console.log(`Generating new daily quiz for ${date}`);

    // Generate deterministic category and difficulty for this date
    const seed = getDailySeed(date);
    const rng = new SeededRandom(seed);

    // Pick category based on day
    const categoryIndex = Math.floor(rng.next() * CATEGORIES.length);
    const category = CATEGORIES[categoryIndex];

    // Mix of difficulties for daily
    const difficulty = "mixed";
    const numQuestions = 5;
    const type = "mixed";

    // Build prompt
    const difficultyInstruction = "Mix of easy, medium, and hard questions";
    const typeInstruction = "Mix of multiple choice, true/false, and short answer questions";

    const prompt = `Generate a trivia quiz with the following parameters:

Category: ${category}
Number of Questions: ${numQuestions}
Difficulty: ${difficultyInstruction}
Question Types: ${typeInstruction}

Return ONLY valid JSON matching this schema:
${SCHEMA_TEMPLATE}

Make the quiz engaging and educational. Ensure all questions are factually accurate.`;

    // Generate with Echo LLM (charges app owner account, not user)
    const result = await generateText({
      model: openai("gpt-4o"),
      system: GENERATION_SYSTEM_PROMPT,
      prompt,
      temperature: 0.8,
    });

    // Parse and validate response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in LLM response");
    }

    const quiz = JSON.parse(jsonMatch[0]);

    // Add unique IDs and shuffle choices
    quiz.id = generateId();
    quiz.createdAt = new Date().toISOString();
    quiz.seeded = true;
    quiz.title = `Today's Challenge: ${category}`;
    quiz.description = `${date} - A new challenge every day at midnight EST`;

    if (quiz.questions) {
      quiz.questions = quiz.questions.map((q: any) => ({
        ...q,
        id: q.id || generateId(),
        choices: q.choices ? shuffleChoices(q.choices, getDailySeed(date + q.prompt)) : undefined,
      }));
    }

    // Cache the generated quiz
    dailyQuizCache = { date, quiz };

    return NextResponse.json(quiz, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("Daily quiz error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily quiz", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

