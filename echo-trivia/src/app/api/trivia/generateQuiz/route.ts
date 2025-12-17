// Seed-based deterministic quiz generation endpoint (simplified)
// Uses streamlined recipe: difficulty curve, tone, explanation style

import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/echo";
import { generateText } from "ai";
import { generateSeed } from "@/lib/rand";
import { buildRecipeFromSeed, DIFFICULTY_CURVES, Labels } from "@/lib/recipe";
import { QuizSchema } from "@/lib/schemas";
import { generateId } from "@/lib/quiz-utils";
import { CATEGORIES } from "@/lib/types";

const SYSTEM_PROMPT = `You are a professional trivia generator. Follow the provided RECIPE exactly.

Return strict JSON with the following structure:
{
  "title": "string",
  "description": "string",
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
}

CRITICAL RULES:
- Do NOT include text outside of JSON
- For multiple_choice: EXACTLY 4 options with IDs A, B, C, D (in that order), exactly one correct
- The choices array must contain exactly 4 objects in order
- For true_false: NO TRICK QUESTIONS - statements must be clearly and unambiguously true or false
- CRITICAL FOR TRUE/FALSE: You MUST balance true and false answers roughly 50/50. Do NOT make all or most answers "true". Actively create statements that are FALSE by using incorrect facts, wrong dates, wrong attributions, etc.
- NEVER include the answer within the question prompt itself
- Use clear phrasing; avoid double negatives
- All questions must be factually accurate
- Follow the difficulty curve progression provided in the recipe`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fixedNumQuestions, category } = body;

    // Generate one 32-byte seed per quiz
    const seedHex = generateSeed();
    const recipe = buildRecipeFromSeed(seedHex, { fixedNumQuestions });

    // Use provided category or pick random one
    const selectedCategory = category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    // Get the difficulty curve for this recipe
    const curve = DIFFICULTY_CURVES[recipe.difficultyCurveId].slice(0, recipe.numQuestions);

    // Convert difficulty curve values to difficulty labels
    const difficultyLabels = curve.map(val => {
      if (val < 0.4) return "easy";
      if (val < 0.7) return "medium";
      return "hard";
    });

    // Build user prompt with recipe details
    const userPrompt = `
RECIPE:
- category: ${selectedCategory}
- num_questions: ${recipe.numQuestions}
- difficulty_curve: [${curve.map(n => n.toFixed(2)).join(", ")}]
- difficulty_labels: [${difficultyLabels.map(d => `"${d}"`).join(", ")}]
- tone: ${Labels.Tone[recipe.tone]}
- explanation_style: ${Labels.ExplanationStyle[recipe.explanation]}

INSTRUCTIONS:
- Create ${recipe.numQuestions} questions about "${selectedCategory}"
- Match each question's difficulty to the corresponding difficulty_label
- For multiple_choice, include exactly 4 options with exactly 1 correct
- Wrong answers must be plausible but clearly distinct from the correct answer
- Write explanations in the "${Labels.ExplanationStyle[recipe.explanation]}" style
- Apply the "${Labels.Tone[recipe.tone]}" tone throughout

Generate a creative title and description for this quiz.
  `.trim();

    // Generate with Echo LLM
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
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

      // Add metadata
      quiz = QuizSchema.parse({
        ...parsed,
        id: generateId(),
        createdAt: new Date().toISOString(),
        category: selectedCategory,
      });
    } catch (error) {
      // Try to repair JSON with LLM
      console.error("JSON parsing failed, attempting repair:", error);

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
        category: selectedCategory,
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

    // Force category on all questions
    quiz.questions = quiz.questions.map((q) => ({
      ...q,
      category: selectedCategory,
    }));

    return NextResponse.json({ recipe, quiz });
  } catch (error) {
    console.error("Generate quiz error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
