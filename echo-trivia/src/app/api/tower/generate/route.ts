// Generate tower floor questions for The Wizard's Tower campaign
// Each floor is 5 multiple choice questions at a specific category + difficulty

import { anthropic, isSignedIn } from "@/echo";
import { generateText } from "ai";
import { QuizSchema } from "@/lib/schemas";
import { generateId } from "@/lib/quiz-utils";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { createClient } from "@/utils/supabase/server";
import { CATEGORIES } from "@/lib/types";
import type { Question } from "@/lib/types";
import { z } from "zod";

// Constants for tower structure
const TOTAL_CATEGORIES = CATEGORIES.length;
const QUESTIONS_PER_FLOOR = 5;

// Tier thresholds based on categories count
// Tier 1 (Easy): floors 1 to TOTAL_CATEGORIES
// Tier 2 (Medium): floors TOTAL_CATEGORIES+1 to TOTAL_CATEGORIES*2
// Tier 3 (Hard): floors TOTAL_CATEGORIES*2+1 to TOTAL_CATEGORIES*3
const TIER_1_MAX = TOTAL_CATEGORIES;
const TIER_2_MAX = TOTAL_CATEGORIES * 2;
const TIER_3_MAX = TOTAL_CATEGORIES * 3;

// Lore frames for each tier
const TIER_LORE = {
  1: { name: "The Lower Archives", description: "Where seekers first learn to read the old texts" },
  2: { name: "The Middle Stacks", description: "Where the Drift begins to obscure the signal" },
  3: { name: "The Upper Sanctum", description: "Where only true maintainers can navigate" },
};

// Type for answer key storage
interface AnswerKey {
  question_id: string;
  answer: string;
  type: string;
  explanation: string;
}

// Request body schema
const TowerGenerateRequestSchema = z.object({
  floorNumber: z.number().min(1).max(TIER_3_MAX),
});

// Get floor data (category, difficulty, tier) from floor number
function getFloorData(floorNumber: number) {
  let tier: 1 | 2 | 3;
  let difficulty: "easy" | "medium" | "hard";

  if (floorNumber <= TIER_1_MAX) {
    tier = 1;
    difficulty = "easy";
  } else if (floorNumber <= TIER_2_MAX) {
    tier = 2;
    difficulty = "medium";
  } else {
    tier = 3;
    difficulty = "hard";
  }

  // Get category index (0-based, wrapping within tier)
  const categoryIndex = (floorNumber - 1) % TOTAL_CATEGORIES;
  const category = CATEGORIES[categoryIndex];

  return {
    floorNumber,
    tier,
    difficulty,
    category,
    tierLore: TIER_LORE[tier],
    totalFloors: TIER_3_MAX,
  };
}

// Strip answers from quiz before sending to client
function stripAnswersFromQuiz(questions: Question[]): Question[] {
  return questions.map((q) => ({
    ...q,
    answer: "", // Remove answer
    explanation: "", // Remove explanation until after answer is submitted
  }));
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
    .upsert(
      {
        quiz_id: quizId,
        answers: answerKeys,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
      {
        onConflict: "quiz_id",
      }
    );

  if (error) {
    console.error("Failed to store answer keys:", error);
    throw new Error("Failed to securely store quiz answers");
  }
}

// Get or create tower progress for user
async function getOrCreateTowerProgress(echoUserId: string) {
  const supabase = createServiceClient();

  // Try to get existing progress
  const { data: existing, error: fetchError } = await supabase
    .from("tower_progress")
    .select("*")
    .eq("echo_user_id", echoUserId)
    .single();

  if (existing) {
    return existing;
  }

  // Create new progress if doesn't exist
  if (fetchError?.code === "PGRST116") {
    // No rows returned
    const { data: newProgress, error: insertError } = await supabase
      .from("tower_progress")
      .insert({
        echo_user_id: echoUserId,
        current_floor: 1,
        highest_floor: 1,
        floor_attempts: {},
        total_questions: 0,
        total_correct: 0,
        perfect_floors: [],
        category_stats: {},
        achievements: [],
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create tower progress:", insertError);
      throw new Error("Failed to initialize tower progress");
    }

    return newProgress;
  }

  if (fetchError) {
    console.error("Failed to fetch tower progress:", fetchError);
    throw new Error("Failed to fetch tower progress");
  }

  return existing;
}

const TOWER_SYSTEM_PROMPT = `You are a professional trivia author creating questions for The Wizard's Tower campaign.

Rules:
- Produce EXACTLY 5 high-quality multiple choice questions.
- Each question MUST have exactly 4 options with IDs: A, B, C, D (in that order).
- Exactly one option must be correct.
- Include a concise explanation for each question (1-2 sentences).
- Match the specified difficulty level consistently across all questions.
- Avoid ambiguous or opinion-based items.
- Use clear phrasing; avoid double negatives.
- NEVER include the answer within the question prompt itself.
- The "answer" field should be the choice ID (A, B, C, or D).
- Wrong answers should be plausible but distinctly different from the correct answer.
- Focus on testing knowledge, NOT on tricking the user.

Difficulty Guidelines:
- EASY: Accessible facts that most trivia enthusiasts would know, but not trivially obvious.
- MEDIUM: More specific topics requiring moderate subject knowledge.
- HARD: Lesser-known facts, challenging even for enthusiasts.

Output: valid JSON ONLY matching the schema.`;

const SCHEMA_TEMPLATE = `{
  "title": "string",
  "description": "string",
  "category": "string",
  "questions": [
    {
      "id": "string (generate unique IDs)",
      "type": "multiple_choice",
      "difficulty": "easy | medium | hard",
      "category": "string",
      "prompt": "string",
      "choices": [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],
      "answer": "string (A, B, C, or D)",
      "explanation": "string"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const signedIn = await isSignedIn();
    if (!signedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user info from Echo
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const echoUserId = user.id;

    // Parse and validate request body
    const body = await request.json();
    const parsed = TowerGenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { floorNumber } = parsed.data;

    // Get floor data (category, difficulty, tier)
    const floorData = getFloorData(floorNumber);

    // Get or create user's tower progress
    const progress = await getOrCreateTowerProgress(echoUserId);

    // Validate floor access - can only attempt current floor or lower
    if (floorNumber > progress.highest_floor) {
      return NextResponse.json(
        {
          error: "Floor not accessible",
          message: `You can only attempt floors up to ${progress.highest_floor}. Complete floor ${progress.current_floor} first.`
        },
        { status: 403 }
      );
    }

    // Generate questions
    const prompt = `Generate ${QUESTIONS_PER_FLOOR} multiple choice trivia questions about "${floorData.category}".

Floor: ${floorNumber} of ${floorData.totalFloors}
Tier: ${floorData.tierLore.name}
Difficulty: ALL questions must be ${floorData.difficulty.toUpperCase()}

CRITICAL: The "category" field in your response MUST be EXACTLY: "${floorData.category}"
Do NOT change, normalize, or abbreviate the category name.

INSTRUCTIONS:
- Create EXACTLY ${QUESTIONS_PER_FLOOR} questions at ${floorData.difficulty} difficulty
- ALL questions must be multiple_choice with exactly 4 options (A, B, C, D)
- Match the ${floorData.difficulty} difficulty level for all questions
- Include concise explanations (1-2 sentences) for each question
- Make each question feel distinct and original

Return ONLY valid JSON matching this schema:
${SCHEMA_TEMPLATE}`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: TOWER_SYSTEM_PROMPT,
      prompt,
      temperature: 1.0, // Higher temperature for variety
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
    } catch (parseError) {
      // Try to repair JSON with LLM
      console.error("JSON parsing failed, attempting repair:", parseError);

      const repairResult = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: "You fix invalid JSON to match a schema. Return ONLY the corrected JSON.",
        prompt: `Fix this JSON to match the schema:\n\nInvalid JSON:\n${result.text}\n\nRequired Schema:\n${SCHEMA_TEMPLATE}`,
      });

      const repairedJson = repairResult.text.match(/\{[\s\S]*\}/)?.[0];
      if (!repairedJson) {
        throw new Error("Failed to repair JSON");
      }

      const parsedRepair = JSON.parse(repairedJson);
      quiz = QuizSchema.parse({
        ...parsedRepair,
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
    }

    // Ensure choices are in A, B, C, D order
    quiz.questions = quiz.questions.map((q) => {
      if (q.type === "multiple_choice" && q.choices) {
        const sortedChoices = [...q.choices].sort((a, b) => a.id.localeCompare(b.id));
        return { ...q, choices: sortedChoices };
      }
      return q;
    });

    // Force the category to match exactly what was requested
    quiz.category = floorData.category;
    quiz.questions = quiz.questions.map((q) => ({
      ...q,
      category: floorData.category,
      difficulty: floorData.difficulty, // Ensure difficulty matches floor
    }));

    // Ensure exactly 5 questions (truncate if more, which shouldn't happen)
    quiz.questions = quiz.questions.slice(0, QUESTIONS_PER_FLOOR);

    // SECURITY: Store answers server-side and strip from client response
    await storeAnswerKeys(quiz.id!, quiz.questions);
    const clientQuestions = stripAnswersFromQuiz(quiz.questions);

    // Return floor data with questions (answers stripped)
    return NextResponse.json({
      floorNumber: floorData.floorNumber,
      tier: floorData.tier,
      tierName: floorData.tierLore.name,
      tierDescription: floorData.tierLore.description,
      difficulty: floorData.difficulty,
      category: floorData.category,
      totalFloors: floorData.totalFloors,
      quizId: quiz.id,
      questions: clientQuestions,
      progress: {
        currentFloor: progress.current_floor,
        highestFloor: progress.highest_floor,
        totalQuestions: progress.total_questions,
        totalCorrect: progress.total_correct,
        perfectFloors: progress.perfect_floors?.length || 0,
      },
    });
  } catch (error) {
    console.error("Tower generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate floor", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
