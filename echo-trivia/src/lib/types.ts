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
  gameMode?: 'daily' | 'practice' | 'endless' | 'jeopardy' | 'campaign';
}

export const CATEGORIES = [
  // Original 20 categories
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

  // Pop Culture & Entertainment
  "Anime & Manga",
  "Comic Books & Graphic Novels",
  "Broadway & Theater",
  "Podcasts & Radio",
  "Memes & Internet Culture",
  "Reality TV",
  "Stand-Up Comedy",
  "Award Shows & Ceremonies",

  // Academic & Intellectual
  "Philosophy",
  "Psychology",
  "Linguistics & Languages",
  "Anthropology",
  "Sociology",
  "Mathematics",
  "Chemistry",
  "Physics",
  "Biology",
  "Astronomy",

  // Regional & Cultural
  "Asian History & Culture",
  "European History & Culture",
  "Latin American History & Culture",
  "Middle Eastern History & Culture",
  "African History & Culture",
  "Ancient Civilizations",
  "Indigenous Cultures",
  "World Religions",

  // Historical Eras (Time-Specific)
  "Ancient Rome",
  "Ancient Greece",
  "Medieval Times",
  "Renaissance Era",
  "Age of Exploration",
  "Industrial Revolution",
  "World Wars",
  "Cold War Era",
  "1960s-1970s Culture",
  "1980s Nostalgia",
  "1990s Nostalgia",
  "2000s Pop Culture",

  // Professional & Specialized
  "Law & Legal Systems",
  "Military & Warfare",
  "Aviation & Aerospace",
  "Maritime & Naval History",
  "Engineering & Innovation",
  "Medicine & Healthcare",
  "Education & Academia",
  "Journalism & Media",

  // Hobbies & Lifestyle
  "Cooking & Culinary Arts",
  "Wine & Spirits",
  "Coffee & Tea",
  "Fitness & Exercise",
  "Yoga & Meditation",
  "Board Games & Tabletop",
  "Card Games & Poker",
  "Puzzles & Brain Teasers",
  "Photography",
  "Gardening & Horticulture",

  // Sports (More Specific)
  "Soccer/Football",
  "Basketball",
  "Baseball",
  "American Football",
  "Tennis",
  "Golf",
  "Olympic Sports",
  "Extreme Sports",
  "Combat Sports",
  "Motorsports & Racing",

  // Arts (More Specific)
  "Classical Music",
  "Jazz & Blues",
  "Rock & Roll History",
  "Hip Hop & Rap",
  "Country Music",
  "Electronic & Dance Music",
  "Painting & Visual Arts",
  "Sculpture",
  "Street Art & Graffiti",

  // Science & Nature (More Specific)
  "Marine Biology & Oceanography",
  "Dinosaurs & Paleontology",
  "Insects & Entomology",
  "Birds & Ornithology",
  "Ecology & Environment",
  "Climate & Weather",
  "Volcanoes & Earthquakes",
  "Genetics & DNA",
  "Neuroscience",

  // Technology (More Specific)
  "Cryptocurrency & Blockchain",
  "Artificial Intelligence",
  "Cybersecurity",
  "Gaming Hardware & Consoles",
  "Internet History",

  // Quirky & Fun
  "Urban Legends & Folklore",
  "Conspiracy Theories",
  "Famous Disasters & Accidents",
  "Unsolved Mysteries",
  "Famous Trials & Court Cases",
  "Hoaxes & Pranks",
  "Inventions & Patents",
  "Superstitions & Traditions",
  "Oddities & Strange Facts",

  // Literature (More Specific)
  "Poetry",
  "Science Fiction",
  "Fantasy Literature",
  "Mystery & Detective Fiction",
  "Horror & Gothic Literature",
  "Romance Novels",
  "Children's Literature",
  "Shakespeare",

  // Geography (More Specific)
  "World Capitals",
  "Mountains & Peaks",
  "Rivers & Lakes",
  "Deserts & Biomes",
  "Islands & Archipelagos",
  "US Geography",
  "European Geography",
  "Flags & Symbols",

  // Food & Drink (More Specific)
  "Baking & Pastries",
  "International Cuisine",
  "Fast Food & Chains",
  "Cocktails & Mixology",
  "Craft Beer & Brewing",
  "Candy & Sweets",

  // Miscellaneous
  "Toys & Collectibles",
  "Brands & Logos",
  "Holidays & Celebrations",
  "Weddings & Traditions",
  "Etiquette & Manners",
  "Crime & Criminology",
  "Pirates & Privateers",
  "Royalty & Nobility",
  "Animals & Pets",
  "Plants & Flowers",
  "Cartoons & Animation",
] as const;

export type Category = typeof CATEGORIES[number];

