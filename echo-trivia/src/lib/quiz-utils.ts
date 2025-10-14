// Quiz utility functions

import type { Quiz, Question } from "./types";

// Generate deterministic seed from string with better distribution
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // DJB2 hash algorithm with XOR for better distribution
    hash = ((hash << 5) + hash) ^ char; // hash * 33 ^ char
  }
  // Additional mixing to improve distribution for similar inputs
  hash = hash ^ (hash >>> 16);
  hash = Math.imul(hash, 0x85ebca6b);
  hash = hash ^ (hash >>> 13);
  hash = Math.imul(hash, 0xc2b2ae35);
  hash = hash ^ (hash >>> 16);
  return Math.abs(hash);
}

// Seeded random number generator
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Shuffle MCQ choices with deterministic seed
export function shuffleChoices(question: Question): Question {
  if (question.type !== "multiple_choice" || !question.choices) {
    return question;
  }

  const seed = hashString(question.id);
  const rng = new SeededRandom(seed);
  const shuffled = rng.shuffle(question.choices);

  return {
    ...question,
    choices: shuffled,
  };
}

// Get daily quiz seed for a date
export function getDailySeed(date: string): number {
  return hashString(`daily-quiz-${date}`);
}

// Get current date in YYYY-MM-DD format (EST timezone)
export function getTodayString(): string {
  const now = new Date();
  // Convert to EST (UTC-5) or EDT (UTC-4)
  // Use America/New_York timezone for automatic DST handling
  const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const year = estDate.getFullYear();
  const month = String(estDate.getMonth() + 1).padStart(2, '0');
  const day = String(estDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate quiz score
export function calculateScore(quiz: Quiz, submissions: Array<{ correct: boolean }>): number {
  if (submissions.length === 0) return 0;
  const correct = submissions.filter((s) => s.correct).length;
  return Math.round((correct / quiz.questions.length) * 100);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

