import { rollFrom, rollSample, rollIndex } from "./rand";
import { CATEGORIES as EXISTING_CATEGORIES } from "./types";

// Map existing category strings to enum indices
// Using the exact categories from types.ts
export enum Category {
  HISTORY = 0,
  SCIENCE = 1,
  LITERATURE = 2,
  FILM_TV = 3,
  SPORTS = 4,
  GEOGRAPHY = 5,
  ARTS = 6,
  TECHNOLOGY = 7,
  GENERAL_KNOWLEDGE = 8,
  MUSIC = 9,
  FOOD_DRINK = 10,
  NATURE_ANIMALS = 11,
  MYTHOLOGY = 12,
  SPACE_ASTRONOMY = 13,
  VIDEO_GAMES = 14,
  POLITICS_GOVERNMENT = 15,
  BUSINESS_ECONOMICS = 16,
  HEALTH_MEDICINE = 17,
  ARCHITECTURE = 18,
  FASHION = 19,
}

export const CATEGORIES = Object.values(Category).filter(v => typeof v === "number") as Category[];

// Map enum back to existing string categories for API compatibility
export const CATEGORY_STRINGS: readonly string[] = EXISTING_CATEGORIES;

export function categoryEnumToString(cat: Category): string {
  return CATEGORY_STRINGS[cat];
}

export function categoryStringToEnum(str: string): Category | undefined {
  const idx = CATEGORY_STRINGS.indexOf(str);
  return idx >= 0 ? idx as Category : undefined;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 0,
  TRUE_FALSE = 1,
  FILL_BLANK = 2,
}
const QT = Object.values(QuestionType).filter(v => typeof v === "number") as QuestionType[];

export enum Tone {
  SCHOLARLY = 0,
  PLAYFUL = 1,
  CINEMATIC = 2,
  PUB_QUIZ = 3,
  DEADPAN = 4,
  SPORTS_BANTER = 5,
}
const TONES = Object.values(Tone).filter(v => typeof v === "number") as Tone[];

export enum Era {
  ANCIENT = 0,
  MEDIEVAL = 1,
  EARLY_MODERN = 2,
  MODERN = 3,
  CONTEMPORARY = 4,
  MIXED = 5,
}
const ERAS = Object.values(Era).filter(v => typeof v === "number") as Era[];

export enum ExplanationStyle {
  ONE_LINE_FACT = 0,
  COMPARE_CONTRAST = 1,
  MINI_STORY = 2,
  WHY_WRONG = 3,
}
const EXPL = Object.values(ExplanationStyle).filter(v => typeof v === "number") as ExplanationStyle[];

export const DIFFICULTY_CURVES: readonly number[][] = [
  [0.2, 0.35, 0.45, 0.6, 0.75, 0.85, 0.9, 0.95, 1.0, 0.9], // ramp
  [0.5, 0.4, 0.6, 0.35, 0.7, 0.45, 0.8, 0.55, 0.9, 1.0],   // wave
  [0.8, 0.7, 0.6, 0.5, 0.4, 0.45, 0.55, 0.65, 0.8, 0.9],   // valley
] as const;

export interface Recipe {
  seedHex: string;
  numQuestions: 5 | 10;
  difficultyCurveId: 0 | 1 | 2;
  categoryMix: Category[];
  questionTypes: QuestionType[];
  tone: Tone;
  era: Era;
  explanation: ExplanationStyle;
}

export function buildRecipeFromSeed(seedHex: string, opts?: { fixedNumQuestions?: 5 | 10 }): Recipe {
  const numQuestions = opts?.fixedNumQuestions ?? (rollIndex(seedHex, "numQuestions", 2) === 0 ? 10 : 5);
  const kCats = 4 + rollIndex(seedHex, "kCats", 3); // 4..6
  const kQTypes = 2 + rollIndex(seedHex, "kQTypes", 2); // 2..3

  const tone = rollFrom(seedHex, "tone", TONES);
  const era = rollFrom(seedHex, "era", ERAS);
  const categoryMix = rollSample(seedHex, "categories", CATEGORIES, kCats);
  const questionTypes = rollSample(seedHex, "qtypes", QT, kQTypes);
  const explanation = rollFrom(seedHex, "explanation", EXPL);
  const difficultyCurveId = rollIndex(seedHex, "curve", 3) as 0 | 1 | 2;

  return {
    seedHex,
    numQuestions,
    difficultyCurveId,
    categoryMix,
    questionTypes,
    tone,
    era,
    explanation,
  };
}

// Label mappers for prompt readability
export const Labels = {
  Category: CATEGORY_STRINGS,
  QuestionType: ["multiple_choice", "true_false", "fill_blank"],
  Tone: ["scholarly", "playful", "cinematic", "pub_quiz", "deadpan", "sports_banter"],
  Era: ["ancient", "medieval", "early_modern", "modern", "contemporary", "mixed"],
  ExplanationStyle: ["one_line_fact", "compare_contrast", "mini_story", "why_wrong"],
} as const;
