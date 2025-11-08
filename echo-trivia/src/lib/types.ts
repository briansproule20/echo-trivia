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
  earnedTitle?: string;
  earnedTier?: string;
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
  "Music",
  "Food & Drink",
  "Nature & Animals",
  "Mythology",
  "Space & Astronomy",
  "Video Games",
  "Politics & Government",
  "Business & Economics",
  "Health & Medicine",
  "Architecture",
  "Fashion",
  // New categories - added silently to naturally work into rotation
  "Philosophy",
  "Psychology",
  "Mathematics",
  "World Religions",
  "Ancient Civilizations",
  "Medieval Times",
  "World Wars",
  "1980s Nostalgia",
  "1990s Nostalgia",
  "Law & Legal Systems",
  "Military & Warfare",
  "Aviation & Aerospace",
  "Engineering & Innovation",
  "Wine & Spirits",
  "Coffee & Tea",
  "Board Games & Tabletop",
  "Photography",
  "Olympic Sports",
  "Classical Music",
  "Jazz & Blues",
  "Hip Hop & Rap",
  "Marine Biology",
  "Dinosaurs & Paleontology",
  "Ecology & Environment",
  "Artificial Intelligence",
  "Cybersecurity",
  "Internet History",
  "Urban Legends & Folklore",
  "Guinness World Records",
  "Unsolved Mysteries",
  "Inventions & Patents",
  "Poetry",
  "Science Fiction",
  "Fantasy Literature",
  "Mystery & Detective Fiction",
  "Horror & Gothic Literature",
  "Shakespeare",
  "World Capitals",
  "International Cuisine",
  "Cocktails & Mixology",
] as const;

export type Category = typeof CATEGORIES[number];

