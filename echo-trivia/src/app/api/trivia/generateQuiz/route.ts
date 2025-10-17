// New seed-based deterministic quiz generation endpoint

import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/echo";
import { generateText } from "ai";
import { generateSeed } from "@/lib/rand";
import { buildRecipeFromSeed, DIFFICULTY_CURVES, Labels, categoryEnumToString } from "@/lib/recipe";
import { QuizSchema } from "@/lib/schemas";
import { generateId } from "@/lib/quiz-utils";

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
- NEVER include the answer within the question prompt itself
- Use clear phrasing; avoid double negatives
- All questions must be factually accurate
- Distribute categories across questions; avoid consecutive questions with the same category when possible
- Follow the difficulty curve progression provided in the recipe`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fixedNumQuestions } = body;

    // Generate one 32-byte seed per quiz
    const seedHex = generateSeed();
    const recipe = buildRecipeFromSeed(seedHex, { fixedNumQuestions });

    // Get the difficulty curve for this recipe
    const curve = DIFFICULTY_CURVES[recipe.difficultyCurveId].slice(0, recipe.numQuestions);

    // Convert difficulty curve values to difficulty labels
    const difficultyLabels = curve.map(val => {
      if (val < 0.4) return "easy";
      if (val < 0.7) return "medium";
      return "hard";
    });

    // Helper to convert enum arrays to label arrays
    const toLabel = (arr: number[], labels: readonly string[]) => arr.map(i => labels[i]);

    // Convert category enums to strings
    const categoryStrings = recipe.categoryMix.map(cat => categoryEnumToString(cat));

    // Build user prompt with recipe details
    const userPrompt = `
RECIPE:
- num_questions: ${recipe.numQuestions}
- difficulty_curve: [${curve.map(n => n.toFixed(2)).join(", ")}]
- difficulty_labels: [${difficultyLabels.map(d => `"${d}"`).join(", ")}]
- category_mix: ${categoryStrings.join(", ")}
- question_types: ${toLabel(recipe.questionTypes as unknown as number[], Labels.QuestionType).join(", ")}
- tone: ${Labels.Tone[recipe.tone]}
- era: ${Labels.Era[recipe.era]}
- region: ${Labels.Region[recipe.region]}
- distractor_styles: ${toLabel(recipe.distractors as unknown as number[], Labels.DistractorStyle).join(", ")}
- explanation_style: ${Labels.ExplanationStyle[recipe.explanation]}

INSTRUCTIONS:
- Create ${recipe.numQuestions} questions matching the recipe
- Use the categories from category_mix, distributing them across questions
- Avoid asking the same category twice in a row if possible
- Match each question's difficulty to the corresponding difficulty_label
- For multiple_choice, include exactly 4 options with exactly 1 correct
- Use distractor styles: ${toLabel(recipe.distractors as unknown as number[], Labels.DistractorStyle).join(", ")}
- Write explanations in the "${Labels.ExplanationStyle[recipe.explanation]}" style
- Apply the "${Labels.Tone[recipe.tone]}" tone throughout
- Focus on the "${Labels.Era[recipe.era]}" era and "${Labels.Region[recipe.region]}" region when relevant
- Use question types: ${toLabel(recipe.questionTypes as unknown as number[], Labels.QuestionType).join(", ")}

Generate a creative title and description for this quiz based on the recipe.
  `.trim();

    // Generate with Echo LLM using existing temperature
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.8, // Keep existing temperature
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
        category: categoryStrings[0], // Primary category
      });
    } catch (error) {
      // Try to repair JSON with LLM (retry with same recipe - idempotent)
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
        category: categoryStrings[0],
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
