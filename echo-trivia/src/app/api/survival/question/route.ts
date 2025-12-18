// Survival Mode - Generate single question
// Each question is from a random category (mixed mode) or specified category (category mode)
// Only easy/medium difficulty, MCQ or T/F (no short answer for faster play)

import { anthropic } from "@/echo";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { generateId } from "@/lib/quiz-utils";
import { createServiceClient } from "@/utils/supabase/service";
import { CATEGORIES } from "@/lib/types";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getActiveRun, setActiveRun, type SurvivalRunState } from "@/lib/survival-state";

const RequestSchema = z.object({
  run_id: z.string().optional(),
  mode: z.enum(["mixed", "category"]),
  category: z.string().optional(),
  echo_user_id: z.string(),
});

// Type for answer key storage
interface AnswerKey {
  question_id: string;
  answer: string;
  type: string;
  explanation: string;
}

const SURVIVAL_SYSTEM_PROMPT = `You are a trivia question generator for a survival game mode.
Generate exactly ONE high-quality trivia question.

Rules:
- Question type: multiple_choice OR true_false (randomly choose)
- Difficulty: easy OR medium (randomly choose, weighted toward medium)
- Multiple choice MUST have exactly 4 options with IDs: A, B, C, D (in that order)
- True/false statements must be clearly and unambiguously true or false - NO TRICK QUESTIONS
- Balance true/false answers (don't always make them true)
- Make wrong answers plausible but clearly distinct from correct answer
- Include a concise explanation (1-2 sentences)
- Questions should be interesting and educational
- Avoid overly famous/trivial facts for easy questions

Return ONLY valid JSON matching this exact schema:
{
  "type": "multiple_choice" | "true_false",
  "difficulty": "easy" | "medium",
  "prompt": "string",
  "choices": [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],
  "answer": "A/B/C/D for MCQ, true/false for T/F",
  "explanation": "string"
}

For true_false questions, omit the "choices" field entirely.`;


// Store answer key for a single question
async function storeAnswerKey(quizId: string, questionId: string, answer: string, type: string, explanation: string): Promise<void> {
  const supabase = createServiceClient();

  const answerKeys: AnswerKey[] = [{
    question_id: questionId,
    answer,
    type,
    explanation,
  }];

  const { error } = await supabase
    .from("quiz_answer_keys")
    .upsert({
      quiz_id: quizId,
      answers: answerKeys,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour for survival
    }, {
      onConflict: "quiz_id",
    });

  if (error) {
    console.error("Failed to store answer key:", error);
    throw new Error("Failed to securely store question answer");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { run_id, mode, category, echo_user_id } = RequestSchema.parse(body);

    // Validate category mode has a category
    if (mode === "category" && !category) {
      return NextResponse.json(
        { error: "Category is required for category mode" },
        { status: 400 }
      );
    }

    let runState = run_id ? getActiveRun(run_id) : undefined;
    let currentRunId = run_id;

    // Start new run if no run_id provided
    if (!currentRunId || !runState) {
      currentRunId = randomUUID();
      runState = {
        echo_user_id,
        mode,
        category: mode === "category" ? category! : null,
        streak: 0,
        categories_seen: [],
        start_time: Date.now(),
        last_question_id: null,
        questions_attempted: [],
      };
      setActiveRun(currentRunId, runState);
    }

    // Verify user owns this run
    if (runState.echo_user_id !== echo_user_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Select category for this question
    const questionCategory = mode === "category"
      ? category!
      : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    // Generate question with LLM
    const prompt = `Generate one trivia question about: ${questionCategory}

The question should be appropriate for a survival game mode where players answer until they get one wrong.
Make it challenging but fair. Difficulty should be easy or medium.`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SURVIVAL_SYSTEM_PROMPT,
      prompt,
      temperature: 1.0, // High variety
    });

    // Parse response
    let question;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      question = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("JSON parsing failed:", error);
      return NextResponse.json(
        { error: "Failed to generate question" },
        { status: 500 }
      );
    }

    // Generate question ID
    const questionId = generateId();

    // Store answer key server-side
    await storeAnswerKey(
      currentRunId,
      questionId,
      question.answer,
      question.type,
      question.explanation || ""
    );

    // Update run state
    // Note: Don't add to categories_seen yet - only add when user answers correctly
    runState.last_question_id = questionId;

    // Add question to tracking (will be updated with answer result later)
    runState.questions_attempted.push({
      question_id: questionId,
      prompt: question.prompt,
      category: questionCategory,
      user_answer: null,
      correct_answer: null,
      is_correct: null,
      explanation: null,
    });

    // Ensure choices are sorted for MCQ
    if (question.type === "multiple_choice" && question.choices) {
      question.choices = question.choices.sort((a: { id: string }, b: { id: string }) =>
        a.id.localeCompare(b.id)
      );
    }

    // Return question WITHOUT answer
    return NextResponse.json({
      run_id: currentRunId,
      question: {
        id: questionId,
        type: question.type,
        difficulty: question.difficulty,
        category: questionCategory,
        prompt: question.prompt,
        choices: question.choices, // undefined for T/F
      },
      category: questionCategory,
      current_streak: runState.streak,
      time_started: new Date(runState.start_time).toISOString(),
    });

  } catch (error) {
    console.error("Survival question error:", error);
    return NextResponse.json(
      { error: "Failed to generate question", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

