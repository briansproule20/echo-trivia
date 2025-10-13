// Zod validation schemas for Trivia Wizard

import { z } from "zod";

export const QuestionTypeSchema = z.enum(["multiple_choice", "true_false", "short_answer"]);
export const DifficultySchema = z.enum(["easy", "medium", "hard"]);
export const QuizStyleSchema = z.enum(["classic", "speedrun", "survival"]);

export const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeSchema,
  category: z.string(),
  difficulty: DifficultySchema,
  prompt: z.string(),
  choices: z.array(ChoiceSchema).optional(),
  answer: z.string(),
  explanation: z.string().optional(),
});

export const QuizSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  questions: z.array(QuestionSchema),
  createdAt: z.string().optional(),
  seeded: z.boolean().optional(),
});

export const PlaySettingsSchema = z.object({
  category: z.string(),
  numQuestions: z.number().min(5).max(50),
  difficulty: z.union([DifficultySchema, z.literal("mixed")]),
  type: z.union([QuestionTypeSchema, z.literal("mixed")]),
  style: QuizStyleSchema.optional(),
  timePerQuestionSec: z.number().optional(),
});

export const SubmissionSchema = z.object({
  questionId: z.string(),
  response: z.string(),
  correct: z.boolean(),
  timeMs: z.number(),
});

export const SessionSchema = z.object({
  id: z.string(),
  quiz: QuizSchema,
  startedAt: z.string(),
  endedAt: z.string().optional(),
  submissions: z.array(SubmissionSchema),
  score: z.number().optional(),
});

export const EvaluateRequestSchema = z.object({
  question: QuestionSchema,
  response: z.string(),
});

export const EvaluateResponseSchema = z.object({
  correct: z.boolean(),
  canonicalAnswer: z.string(),
  explanation: z.string(),
});

