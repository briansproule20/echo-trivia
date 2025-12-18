// Survival Mode - Submit answer
// Verifies answer server-side, updates streak or ends run

import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { z } from "zod";
import { getActiveRun, deleteActiveRun, type QuestionAttempt } from "@/lib/survival-state";

const RequestSchema = z.object({
  run_id: z.string(),
  question_id: z.string(),
  response: z.string(),
  time_ms: z.number().optional(),
  echo_user_id: z.string(),
});

// Type for answer key from database
interface AnswerKey {
  question_id: string;
  answer: string;
  type: string;
  explanation: string;
}

// Look up answer key from server-side storage
async function getAnswerKey(runId: string, questionId: string): Promise<AnswerKey | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("quiz_answer_keys")
    .select("answers")
    .eq("quiz_id", runId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch answer key:", error);
    return null;
  }

  const answers = data.answers as AnswerKey[];
  return answers.find((a) => a.question_id === questionId) || null;
}

// Save completed run to database
async function saveRun(
  runId: string,
  echoUserId: string,
  mode: "mixed" | "category",
  category: string | null,
  streak: number,
  categoriesSeen: string[],
  timePlayed: number,
  questionsAttempted: QuestionAttempt[]
): Promise<{ rank: number | null; isPersonalBest: boolean }> {
  const supabase = createServiceClient();

  // Get user_id from echo_user_id
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("echo_user_id", echoUserId)
    .single();

  // Save to survival_runs
  const { data: insertedRun, error: runError } = await supabase
    .from("survival_runs")
    .insert({
      id: runId,
      user_id: userData?.id || null,
      echo_user_id: echoUserId,
      mode,
      category,
      streak,
      categories_seen: categoriesSeen,
      time_played_seconds: Math.floor(timePlayed / 1000),
      ended_at: new Date().toISOString(),
      questions_attempted: questionsAttempted,
    })
    .select()
    .single();

  if (runError) {
    console.error("Failed to save survival run:", runError);
    console.error("Run data attempted:", { runId, echoUserId, mode, category, streak });
    throw new Error(`Failed to save survival run: ${runError.message}`);
  }

  console.log("Successfully saved survival run:", insertedRun?.id);

  // Also save to quiz_sessions for stats integration (use same ID for linking)
  const { error: sessionError } = await supabase
    .from("quiz_sessions")
    .insert({
      id: runId, // Use same ID as survival_runs for linking
      user_id: userData?.id || null,
      echo_user_id: echoUserId,
      category: category || "Mixed",
      num_questions: streak + 1, // Total questions attempted
      correct_answers: streak, // Correct = streak (wrong answer ends it)
      total_questions: streak + 1,
      score_percentage: streak > 0 ? (streak / (streak + 1)) * 100 : 0,
      difficulty: "mixed",
      quiz_type: "mixed",
      is_daily: false,
      game_mode: "endless",
      time_taken: Math.floor(timePlayed / 1000),
      completed_at: new Date().toISOString(),
    });

  if (sessionError) {
    console.error("Failed to save quiz session:", sessionError);
  }

  // Calculate rank
  let rank: number | null = null;
  if (mode === "mixed") {
    const { count } = await supabase
      .from("survival_runs")
      .select("*", { count: "exact", head: true })
      .eq("mode", "mixed")
      .gt("streak", streak);
    rank = count !== null ? count + 1 : null;
  } else if (category) {
    const { count } = await supabase
      .from("survival_runs")
      .select("*", { count: "exact", head: true })
      .eq("mode", "category")
      .eq("category", category)
      .gt("streak", streak);
    rank = count !== null ? count + 1 : null;
  }

  // Check if personal best
  let isPersonalBest = false;
  if (mode === "mixed") {
    const { data: bestData } = await supabase
      .from("survival_runs")
      .select("streak")
      .eq("echo_user_id", echoUserId)
      .eq("mode", "mixed")
      .neq("id", runId)
      .order("streak", { ascending: false })
      .limit(1)
      .single();

    isPersonalBest = !bestData || streak > bestData.streak;
  } else if (category) {
    const { data: bestData } = await supabase
      .from("survival_runs")
      .select("streak")
      .eq("echo_user_id", echoUserId)
      .eq("mode", "category")
      .eq("category", category)
      .neq("id", runId)
      .order("streak", { ascending: false })
      .limit(1)
      .single();

    isPersonalBest = !bestData || streak > bestData.streak;
  }

  return { rank, isPersonalBest };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { run_id, question_id, response, time_ms, echo_user_id } = RequestSchema.parse(body);

    // Get run state
    const runState = getActiveRun(run_id);
    if (!runState) {
      return NextResponse.json(
        { error: "Run not found or expired" },
        { status: 404 }
      );
    }

    // Verify user owns this run
    if (runState.echo_user_id !== echo_user_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get answer key
    const answerKey = await getAnswerKey(run_id, question_id);
    if (!answerKey) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Evaluate answer (strict comparison for MCQ and T/F)
    const correct = response.toLowerCase().trim() === answerKey.answer.toLowerCase().trim();

    // Update the question in questions_attempted with the answer result
    const questionAttempt = runState.questions_attempted.find(q => q.question_id === question_id);
    if (questionAttempt) {
      questionAttempt.user_answer = response;
      questionAttempt.correct_answer = answerKey.answer;
      questionAttempt.is_correct = correct;
      questionAttempt.explanation = answerKey.explanation || "";
    }

    if (correct) {
      // Increment streak
      runState.streak += 1;

      // Add category to categories_seen for correct answers only
      if (questionAttempt && runState.mode === "mixed") {
        const category = questionAttempt.category;
        if (category && !runState.categories_seen.includes(category)) {
          runState.categories_seen.push(category);
        }
      }

      return NextResponse.json({
        correct: true,
        explanation: answerKey.explanation || "Correct!",
        canonical_answer: answerKey.answer,
        streak: runState.streak,
        game_over: false,
      });
    } else {
      // Game over - save run and clean up
      const timePlayed = Date.now() - runState.start_time;
      const { rank, isPersonalBest } = await saveRun(
        run_id,
        echo_user_id,
        runState.mode,
        runState.category,
        runState.streak,
        runState.categories_seen,
        timePlayed,
        runState.questions_attempted
      );

      // Clean up active run
      deleteActiveRun(run_id);

      // Clean up answer keys
      const supabase = createServiceClient();
      await supabase
        .from("quiz_answer_keys")
        .delete()
        .eq("quiz_id", run_id);

      return NextResponse.json({
        correct: false,
        explanation: answerKey.explanation || `The correct answer was: ${answerKey.answer}`,
        canonical_answer: answerKey.answer,
        streak: runState.streak,
        game_over: true,
        final_stats: {
          streak: runState.streak,
          categories_seen: runState.categories_seen,
          rank,
          time_played: Math.floor(timePlayed / 1000),
          is_personal_best: isPersonalBest,
          questions_attempted: runState.questions_attempted,
          awarded_rank: "Highly Regarded",
        },
      });
    }

  } catch (error) {
    console.error("Survival answer error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

