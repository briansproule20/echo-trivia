// Core types for Trivia Wizard

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type Difficulty = "easy" | "medium" | "hard";
export type QuizStyle = "classic" | "speedrun" | "survival";

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  difficulty: Difficulty;
  prompt: string;
  choices?: Choice[];         // for MCQ
  answer: string;             // canonical answer (choice id or text)
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category: string;
  questions: Question[];
  createdAt: string;
  seeded?: boolean;           // true for Daily Quiz
}

export interface PlaySettings {
  category: string;
  numQuestions: number;       // 5-50
  difficulty: Difficulty | "mixed";
  type: QuestionType | "mixed";
  style?: QuizStyle;
  timePerQuestionSec?: number;
}

export interface Submission {
  questionId: string;
  response: string;
  correct: boolean;
  timeMs: number;
}

export interface Session {
  id: string;
  quiz: Quiz;
  startedAt: string;
  endedAt?: string;
  submissions: Submission[];
  score?: number;
}

export const CATEGORIES = [
  "History",
  "Science",
  "Literature",
  "Film & TV",
  "Sports",
  "Geography",
  "Arts",
  "Technology",
  "General Knowledge",
] as const;

export type Category = typeof CATEGORIES[number];

