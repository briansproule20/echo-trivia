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

// Get current date in human-readable format: "25 October 2025"
export function getTodayFormatted(): string {
  const now = new Date();
  const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = estDate.getDate();
  const month = estDate.toLocaleString('en-US', { month: 'long' });
  const year = estDate.getFullYear();
  return `${day} ${month} ${year}`;
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

// Title grading system
const TITLE_TIERS: Record<number, { tier: string; titles: string[] }> = {
  0: {
    tier: "Disaster Zone",
    titles: [
      "Answerless Wanderer",
      "Trivia Amnesiac",
      "Factually Bankrupt",
      "Lost in the Question Void",
      "Did You Even Try?",
      "Professional Guesser (And Misser)",
      "Brain.exe Has Stopped Responding",
      "The Great Forgetter",
      "Confidently Incorrect Champion",
      "Zero Hero",
      "Maybe Next Time, Champ",
      "The Guess Whisperer",
      "Partial Credit Collector",
      "Wrong But Confident",
      "Future Honorary Participant",
      "Barely Awake Scholar",
      "One Star Yelp Reviewer of Facts",
      "Lucky Accident Specialist",
      "Participation Trophy Enthusiast",
      "Error 404: Knowledge Not Found",
      "Highly Regarded"
    ]
  },
  20: {
    tier: "Rookie Realm",
    titles: [
      "Trivia Tadpole",
      "Wizard's Intern",
      "Novice of Nonsense",
      "Fact Fumbler",
      "On the Syllabus, Just Not Studied",
      "Baby's First Quiz",
      "The Struggling Student",
      "Homework? What Homework?",
      "Knowledge in Training Wheels",
      "Part-Time Brain User",
      "Trivia Tourist",
      "Apprentice of Approximation",
      "Slightly Educated Guessmaster",
      "Almost Smart",
      "Learning Adjacent",
      "Wiki-Skimmer Extraordinaire",
      "The Lukewarm Scholar",
      "Vaguely Informed Citizen",
      "TL;DR Specialist",
      "Kinda Sorta Maybe Right"
    ]
  },
  40: {
    tier: "Middle Ground",
    titles: [
      "Half-Right Hero",
      "Coin-Flip Conjuror",
      "C-Student Sorcerer",
      "The Mediocre Mage",
      "Master of the Maybe",
      "Peak Average Performance",
      "Solidly Mid Savant",
      "The Gray Area Expert",
      "Acceptably Acceptable",
      "Neither Here Nor There Knight",
      "Barely Brilliant",
      "Certified Average",
      "Adequate Alchemist",
      "Competent but Confused",
      "Didn't Fail Club President",
      "The Minimum Viable Scholar",
      "Passed By One Point",
      "Good Enough Guru",
      "Half Full Glass Philosopher",
      "Survivor of the Bell Curve"
    ]
  },
  60: {
    tier: "Sharp Mind",
    titles: [
      "Journeyman of Trivia",
      "Sorcerer's Associate",
      "The Guess Knight",
      "Fact-Finder Apprentice",
      "On the Honor Roll (of Shame)",
      "Pretty Okay Professor",
      "Above Average Andy",
      "B-Tier Brain Trust",
      "The Decently Informed",
      "Respectable, Not Remarkable",
      "Trivia Scholar",
      "Potion of Partial Genius",
      "Knowledge Knight",
      "Sage-ish",
      "Well-Read Rascal",
      "Nerd (Affectionate)",
      "The Smart Friend",
      "Quiz Night MVP Runner-Up",
      "Impressively Informed",
      "Humble Brainiac"
    ]
  },
  80: {
    tier: "Legendary Elite",
    titles: [
      "Quiz Conqueror",
      "Grand Archivist",
      "Fact Wizard Supreme",
      "Master of the Multichoice",
      "The Know-It-Most",
      "Trivia Royalty",
      "Certified Smarty-Pants",
      "Answer Whisperer Deluxe",
      "The Trivia Wizard",
      "Walking Encyclopedia",
      "Elite Scholar",
      "Knowledge Virtuoso",
      "Trivia Champion",
      "Nearly Unstoppable",
      "High Scorer Extraordinaire",
      "Wisdom Keeper",
      "Master Quizzer",
      "Exceptional Mind",
      "Top-Tier Intellect",
      "Almost Flawless"
    ]
  },
  100: {
    tier: "Absolute Perfection",
    titles: [
      "Flawless Victory",
      "Perfect Score Prodigy",
      "Untouchable Genius",
      "Zero Mistakes Deity",
      "Omniscient Oracle",
      "Supreme Sage of the Known Universe",
      "Maximum Brain Power",
      "The Chosen One",
      "Unbeatable Champion",
      "Peak Human Performance",
      "God-Tier Intellect",
      "Infallible Oracle",
      "Literally Perfect",
      "Built Different",
      "Nobody Does It Better",
      "The GOAT",
      "Knows Too Much, Frankly",
      "Basically Google But Human",
      "Ridiculously Overpowered",
      "The Final Boss of Trivia",
      "Frighteningly Smart",
      "Touch Grass (After This Victory Lap)",
      "Big Brain Energy Incarnate",
      "Cloaked in Correctness",
      "Error-Free Excellence",
      "Highly Regarded"
    ]
  }
};

// Generate a random title based on percentage score
export function getRandomTitle(percentage: number): { title: string; tier: string } {
  // Special case for perfect score
  if (percentage === 100) {
    const tierData = TITLE_TIERS[100];
    const randomTitle = tierData.titles[Math.floor(Math.random() * tierData.titles.length)];
    return { title: randomTitle, tier: tierData.tier };
  }

  // For all other scores, use 20% ranges
  const range = Math.floor(percentage / 20) * 20;
  const tierData = TITLE_TIERS[range];
  const randomTitle = tierData.titles[Math.floor(Math.random() * tierData.titles.length)];
  return { title: randomTitle, tier: tierData.tier };
}

