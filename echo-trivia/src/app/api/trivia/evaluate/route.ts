// Evaluate trivia answer - SERVER-SIDE VALIDATION
// Answers are looked up from server storage, NOT trusted from client

import { anthropic } from "@/echo";
import { generateText } from "ai";
import { EvaluateResponseSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { z } from "zod";

// Schema for the new secure evaluate request
// Client only sends quiz_id, question_id, and their response - NOT the answer
const SecureEvaluateRequestSchema = z.object({
  quiz_id: z.string(),
  session_id: z.string(), // Unique per play session - critical for faceoff mode
  question_id: z.string(),
  response: z.string(),
  question_prompt: z.string(), // For LLM fuzzy matching context
  isAuthenticated: z.boolean().optional(),
});

// Type for answer key from database
interface AnswerKey {
  question_id: string;
  answer: string;
  type: string;
  explanation: string;
}

const FUZZY_EVAL_SYSTEM_PROMPT = `You are grading a short answer for trivia.
Decide if the user response is an acceptable alias or equivalent of the canonical answer.
Return JSON: {"score": 0..1, "explanation": "1 sentence"}.
Accept if score ≥ 0.85.
Be generous with synonyms, common abbreviations, and minor spelling variations.`;

// Look up answer key from server-side storage
async function getAnswerKey(quizId: string, questionId: string): Promise<AnswerKey | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("quiz_answer_keys")
    .select("answers")
    .eq("quiz_id", quizId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch answer key:", error);
    return null;
  }

  const answers = data.answers as AnswerKey[];
  return answers.find((a) => a.question_id === questionId) || null;
}

// Store evaluation result server-side (prevents duplicate submissions)
async function storeEvaluation(
  quizId: string,
  questionId: string,
  userResponse: string,
  isCorrect: boolean
): Promise<{ alreadySubmitted: boolean; existingResult?: boolean }> {
  const supabase = createServiceClient();

  // Check if already submitted (prevents re-evaluation abuse)
  const { data: existing } = await supabase
    .from("quiz_evaluations")
    .select("is_correct")
    .eq("quiz_id", quizId)
    .eq("question_id", questionId)
    .single();

  if (existing) {
    return { alreadySubmitted: true, existingResult: existing.is_correct };
  }

  // Store new evaluation
  const { error } = await supabase.from("quiz_evaluations").insert({
    quiz_id: quizId,
    question_id: questionId,
    user_response: userResponse,
    is_correct: isCorrect,
  });

  if (error) {
    console.error("Failed to store evaluation:", error);
    // Don't fail the request, just log it
  }

  return { alreadySubmitted: false };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quiz_id, session_id, question_id, response, question_prompt, isAuthenticated } =
      SecureEvaluateRequestSchema.parse(body);

    // SECURITY: Look up the correct answer from server-side storage
    // Use quiz_id for answer key lookup (answers are stored per quiz)
    const answerKey = await getAnswerKey(quiz_id, question_id);

    if (!answerKey) {
      return NextResponse.json(
        { error: "Quiz or question not found. Quiz may have expired." },
        { status: 404 }
      );
    }

    // Check if this question was already evaluated (prevent abuse)
    // CRITICAL: Use session_id (unique per play) not quiz_id (shared in faceoff mode)
    // This ensures each player's answers are evaluated independently
    const { alreadySubmitted, existingResult } = await storeEvaluation(
      session_id, // Changed from quiz_id - this is the key fix for faceoff mode
      question_id,
      response,
      false // Placeholder, will update if new
    );

    if (alreadySubmitted) {
      // Return the cached result - no re-evaluation allowed
      const result = EvaluateResponseSchema.parse({
        correct: existingResult ?? false,
        canonicalAnswer: answerKey.answer,
        explanation: answerKey.explanation || (existingResult ? "Correct!" : `The correct answer is: ${answerKey.answer}`),
      });
      return NextResponse.json(result);
    }

    let correct = false;
    let explanation = answerKey.explanation || "";

    // Multiple choice and true/false: strict comparison
    if (answerKey.type === "multiple_choice" || answerKey.type === "true_false") {
      correct = response.toLowerCase().trim() === answerKey.answer.toLowerCase().trim();

      if (!explanation) {
        explanation = correct ? "Correct!" : `The correct answer is: ${answerKey.answer}`;
      }
    }
    // Short answer: fuzzy matching with LLM (only for authenticated users)
    else if (answerKey.type === "short_answer") {
      // First try case-insensitive exact match
      const normalizedResponse = response.toLowerCase().trim();
      const normalizedAnswer = answerKey.answer.toLowerCase().trim();

      if (normalizedResponse === normalizedAnswer) {
        correct = true;
      } else if (isAuthenticated !== false) {
        // Use LLM for fuzzy matching only if authenticated
        const evalResult = await generateText({
          model: anthropic("claude-sonnet-4-20250514"),
          system: FUZZY_EVAL_SYSTEM_PROMPT,
          prompt: `Question: ${question_prompt}\nCanonical Answer: ${answerKey.answer}\nUser Response: ${response}\n\nIs the user response acceptable?`,
          temperature: 0.3,
        });

        try {
          const jsonMatch = evalResult.text.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            correct = parsed.score >= 0.85;
            explanation = parsed.explanation || explanation;
          }
        } catch (error) {
          console.error("Fuzzy eval parsing error:", error);
          correct = false;
        }
      }

      if (!explanation) {
        explanation = correct
          ? "Correct! Your answer is acceptable."
          : `Incorrect. The correct answer is: ${answerKey.answer}`;
      }
    }

    // Update the stored evaluation with the actual result
    const supabase = createServiceClient();
    await supabase
      .from("quiz_evaluations")
      .update({ is_correct: correct })
      .eq("quiz_id", session_id) // Use session_id for consistency with storeEvaluation
      .eq("question_id", question_id);

    const result = EvaluateResponseSchema.parse({
      correct,
      canonicalAnswer: answerKey.answer,
      explanation,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Evaluate error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

