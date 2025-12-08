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
  gameMode?: 'daily' | 'freeplay' | 'endless' | 'jeopardy' | 'campaign' | 'faceoff';
  isAuthenticated?: boolean; // Whether user was signed in when starting session
  // Faceoff challenge info (for challenger, not creator)
  faceoffChallenge?: {
    shareCode: string;
    creatorUsername: string | null;
    creatorScore: number | null;
  };
}

export const CATEGORIES = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE CATEGORIES (20)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // POP CULTURE & ENTERTAINMENT (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Anime & Manga",
  "Comic Books & Graphic Novels",
  "Broadway & Theater",
  "Podcasts & Radio",
  "Memes & Internet Culture",
  "Reality TV",
  "Stand-Up Comedy",
  "Award Shows & Ceremonies",

  // ═══════════════════════════════════════════════════════════════════════════
  // ACADEMIC & INTELLECTUAL (10)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // REGIONAL & CULTURAL (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Asian History & Culture",
  "European History & Culture",
  "Latin American History & Culture",
  "Middle Eastern History & Culture",
  "African History & Culture",
  "Ancient Civilizations",
  "Indigenous Cultures",
  "World Religions",

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORICAL ERAS (12)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFESSIONAL & SPECIALIZED (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Law & Legal Systems",
  "Military & Warfare",
  "Aviation & Aerospace",
  "Maritime & Naval History",
  "Engineering & Innovation",
  "Medicine & Healthcare",
  "Education & Academia",
  "Journalism & Media",

  // ═══════════════════════════════════════════════════════════════════════════
  // HOBBIES & LIFESTYLE (10)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // SPORTS SPECIFIC (10)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSIC GENRES (9)
  // ═══════════════════════════════════════════════════════════════════════════
  "Classical Music",
  "Jazz & Blues",
  "Rock & Roll History",
  "Hip Hop & Rap",
  "Country Music",
  "Electronic & Dance Music",
  "Painting & Visual Arts",
  "Sculpture",
  "Street Art & Graffiti",

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE & NATURE SPECIFIC (9)
  // ═══════════════════════════════════════════════════════════════════════════
  "Marine Biology & Oceanography",
  "Dinosaurs & Paleontology",
  "Insects & Entomology",
  "Birds & Ornithology",
  "Ecology & Environment",
  "Climate & Weather",
  "Volcanoes & Earthquakes",
  "Genetics & DNA",
  "Neuroscience",

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNOLOGY SPECIFIC (5)
  // ═══════════════════════════════════════════════════════════════════════════
  "Cryptocurrency & Blockchain",
  "Artificial Intelligence",
  "Cybersecurity",
  "Gaming Hardware & Consoles",
  "Internet History",

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIRKY & FUN (9)
  // ═══════════════════════════════════════════════════════════════════════════
  "Urban Legends & Folklore",
  "Conspiracy Theories",
  "Famous Disasters & Accidents",
  "Unsolved Mysteries",
  "Famous Trials & Court Cases",
  "Hoaxes & Pranks",
  "Inventions & Patents",
  "Superstitions & Traditions",
  "Oddities & Strange Facts",

  // ═══════════════════════════════════════════════════════════════════════════
  // LITERATURE SPECIFIC (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Poetry",
  "Science Fiction",
  "Fantasy Literature",
  "Mystery & Detective Fiction",
  "Horror & Gothic Literature",
  "Romance Novels",
  "Children's Literature",
  "Shakespeare",

  // ═══════════════════════════════════════════════════════════════════════════
  // GEOGRAPHY SPECIFIC (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "World Capitals",
  "Mountains & Peaks",
  "Rivers & Lakes",
  "Deserts & Biomes",
  "Islands & Archipelagos",
  "US Geography",
  "European Geography",
  "Flags & Symbols",

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOD & DRINK SPECIFIC (6)
  // ═══════════════════════════════════════════════════════════════════════════
  "Baking & Pastries",
  "International Cuisine",
  "Fast Food & Chains",
  "Cocktails & Mixology",
  "Craft Beer & Brewing",
  "Candy & Sweets",

  // ═══════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS (11)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  // NEW CATEGORIES (248 more to reach 365)
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIFIC MYTHOLOGIES (4)
  // ═══════════════════════════════════════════════════════════════════════════
  "Greek Mythology",
  "Roman Mythology",
  "Norse Mythology",
  "Egyptian Mythology",

  // ═══════════════════════════════════════════════════════════════════════════
  // FILM & TV FRANCHISES (22)
  // ═══════════════════════════════════════════════════════════════════════════
  "Star Wars Universe",
  "Star Trek Universe",
  "Marvel Cinematic Universe",
  "DC Comics Adaptations",
  "James Bond Films",
  "Indiana Jones Series",
  "Jurassic Park Franchise",
  "The Matrix Trilogy",
  "Breaking Bad",
  "The Sopranos",
  "The Wire",
  "Friends",
  "Seinfeld",
  "The Office",
  "Doctor Who",
  "Stranger Things",
  "The Simpsons",
  "South Park",
  "Rick and Morty",
  "Black Mirror",
  "Parks and Recreation",
  "Arrested Development",

  // ═══════════════════════════════════════════════════════════════════════════
  // LITERARY WORKS & AUTHORS (25)
  // ═══════════════════════════════════════════════════════════════════════════
  "Lord of the Rings",
  "Harry Potter Series",
  "Game of Thrones",
  "The Chronicles of Narnia",
  "Dune",
  "Sherlock Holmes Stories",
  "Agatha Christie Novels",
  "Stephen King Works",
  "H.P. Lovecraft & Cthulhu Mythos",
  "Jane Austen Novels",
  "Charles Dickens Works",
  "Ernest Hemingway",
  "F. Scott Fitzgerald",
  "1984 & George Orwell",
  "Brave New World",
  "To Kill a Mockingbird",
  "The Great Gatsby",
  "Moby Dick",
  "Pride and Prejudice",
  "War and Peace",
  "The Odyssey & Homer",
  "The Divine Comedy",
  "Don Quixote",
  "Crime and Punishment",
  "The Catcher in the Rye",

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSICAL ARTISTS & BANDS (20)
  // ═══════════════════════════════════════════════════════════════════════════
  "The Beatles",
  "The Rolling Stones",
  "Led Zeppelin",
  "Pink Floyd",
  "Queen",
  "David Bowie",
  "Bob Dylan",
  "Michael Jackson",
  "Madonna",
  "Prince",
  "Nirvana",
  "Radiohead",
  "Kanye West",
  "Beyoncé",
  "Taylor Swift",
  "The Grateful Dead",
  "Wu-Tang Clan",
  "Daft Punk",
  "Metallica",
  "AC/DC",

  // ═══════════════════════════════════════════════════════════════════════════
  // VIDEO GAME FRANCHISES (20)
  // ═══════════════════════════════════════════════════════════════════════════
  "Super Mario Series",
  "The Legend of Zelda",
  "Pokémon Games",
  "Final Fantasy Series",
  "The Elder Scrolls",
  "Fallout Series",
  "Grand Theft Auto",
  "Call of Duty",
  "Halo Series",
  "Dark Souls & Souls-like Games",
  "Minecraft",
  "Fortnite",
  "League of Legends",
  "World of Warcraft",
  "The Witcher Games",
  "Red Dead Redemption",
  "Metal Gear Solid",
  "Resident Evil",
  "God of War",
  "Assassin's Creed",

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORICAL EVENTS (15)
  // ═══════════════════════════════════════════════════════════════════════════
  "The Apollo Moon Missions",
  "Fall of the Berlin Wall",
  "The French Revolution",
  "American Civil War",
  "Manhattan Project",
  "Great Depression Economics",
  "Cuban Missile Crisis",
  "Watergate Scandal",
  "Chernobyl Disaster",
  "COVID-19 Pandemic",
  "D-Day & Normandy Invasion",
  "Battle of Stalingrad",
  "American Revolutionary War",
  "Napoleonic Wars",
  "Vietnam War",

  // ═══════════════════════════════════════════════════════════════════════════
  // REGIONAL CUISINES (15)
  // ═══════════════════════════════════════════════════════════════════════════
  "Japanese Cuisine & Sushi",
  "Italian Regional Dishes",
  "French Haute Cuisine",
  "Thai Street Food",
  "Indian Curries & Spices",
  "Mexican Authentic Cuisine",
  "Chinese Regional Cooking",
  "Korean BBQ & Banchan",
  "Vietnamese Pho & Street Food",
  "Spanish Tapas & Paella",
  "Greek Mediterranean Food",
  "Turkish Kebabs & Mezes",
  "Lebanese Middle Eastern",
  "Ethiopian Cuisine",
  "Peruvian Ceviche & Dishes",

  // ═══════════════════════════════════════════════════════════════════════════
  // ARCHITECTURAL LANDMARKS (15)
  // ═══════════════════════════════════════════════════════════════════════════
  "Gothic Architecture",
  "Art Nouveau & Art Deco",
  "Frank Lloyd Wright",
  "The Eiffel Tower",
  "The Taj Mahal",
  "The Great Wall of China",
  "Machu Picchu",
  "The Colosseum",
  "Petra Jordan",
  "Angkor Wat",
  "Sagrada Familia",
  "Burj Khalifa",
  "Sydney Opera House",
  "The Pyramids of Giza",
  "Stonehenge",

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENTIFIC FIGURES (15)
  // ═══════════════════════════════════════════════════════════════════════════
  "Albert Einstein",
  "Isaac Newton",
  "Marie Curie",
  "Charles Darwin",
  "Nikola Tesla",
  "Stephen Hawking",
  "Richard Feynman",
  "Carl Sagan",
  "Alan Turing",
  "Ada Lovelace",
  "Galileo Galilei",
  "Leonardo da Vinci",
  "Rosalind Franklin",
  "Jane Goodall",
  "Neil deGrasse Tyson",

  // ═══════════════════════════════════════════════════════════════════════════
  // ARTISTS & ART MOVEMENTS (15)
  // ═══════════════════════════════════════════════════════════════════════════
  "Vincent van Gogh",
  "Pablo Picasso",
  "Salvador Dalí",
  "Andy Warhol",
  "Banksy",
  "Michelangelo",
  "Rembrandt",
  "Claude Monet",
  "Impressionism",
  "Surrealism",
  "Cubism",
  "Renaissance Art",
  "Baroque Art",
  "Pop Art",
  "Abstract Expressionism",

  // ═══════════════════════════════════════════════════════════════════════════
  // SPORTS FIGURES (15)
  // ═══════════════════════════════════════════════════════════════════════════
  "Michael Jordan",
  "Muhammad Ali",
  "Babe Ruth",
  "Tom Brady",
  "Lionel Messi",
  "Cristiano Ronaldo",
  "Serena Williams",
  "Tiger Woods",
  "Usain Bolt",
  "Michael Phelps",
  "Wayne Gretzky",
  "Pelé",
  "LeBron James",
  "Kobe Bryant",
  "Roger Federer",

  // ═══════════════════════════════════════════════════════════════════════════
  // MYTHICAL CREATURES & FOLKLORE (12)
  // ═══════════════════════════════════════════════════════════════════════════
  "Dragons in World Mythology",
  "Vampires & Vampire Lore",
  "Werewolves & Lycanthropy",
  "Zombies in Pop Culture",
  "Fairies & Fae Folk",
  "Mermaids & Sea Mythology",
  "Japanese Yokai",
  "Celtic Mythology",
  "Slavic Folklore",
  "Native American Legends",
  "African Folklore",
  "Aztec & Mayan Mythology",

  // ═══════════════════════════════════════════════════════════════════════════
  // TECH COMPANIES & PRODUCTS (12)
  // ═══════════════════════════════════════════════════════════════════════════
  "Apple Inc. History",
  "Microsoft & Windows",
  "Google & Search",
  "Amazon & E-Commerce",
  "Tesla & Electric Vehicles",
  "SpaceX & Mars Missions",
  "Social Media Platforms",
  "Netflix & Streaming Wars",
  "iPhone Evolution",
  "PlayStation History",
  "Xbox Gaming",
  "Nintendo History",

  // ═══════════════════════════════════════════════════════════════════════════
  // PSYCHOLOGICAL PHENOMENA (10)
  // ═══════════════════════════════════════════════════════════════════════════
  "Cognitive Biases",
  "Optical Illusions",
  "Memory & Mnemonics",
  "Dreams & Dream Analysis",
  "Phobias & Fears",
  "Personality Types & MBTI",
  "The Placebo Effect",
  "Confirmation Bias",
  "Game Theory",
  "Body Language & Communication",

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTREME GEOGRAPHY (12)
  // ═══════════════════════════════════════════════════════════════════════════
  "Mount Everest Expeditions",
  "Mariana Trench",
  "Amazon Rainforest",
  "Sahara Desert",
  "Antarctica Exploration",
  "The Arctic & North Pole",
  "Grand Canyon",
  "Great Barrier Reef",
  "Galápagos Islands",
  "Iceland's Volcanic Landscape",
  "Norwegian Fjords",
  "New Zealand Geography",

  // ═══════════════════════════════════════════════════════════════════════════
  // MILITARY HISTORY SPECIFICS (10)
  // ═══════════════════════════════════════════════════════════════════════════
  "Samurai & Feudal Japan",
  "Alexander the Great",
  "Mongol Empire",
  "Crusades & Holy Wars",
  "World War I Battles",
  "Pacific Theater WWII",
  "European Theater WWII",
  "Special Forces & Elite Units",
  "Medieval Siege Warfare",
  "Ancient Military Tactics",

  // ═══════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS FUN (15)
  // ═══════════════════════════════════════════════════════════════════════════
  "Guinness World Records",
  "Espionage & Spies",
  "Haunted Places & Ghost Stories",
  "Amusement Parks & Theme Parks",
  "Magic & Illusions",
  "Advertising & Marketing",
  "Circus & Carnival History",
  "Treasure Hunts & Lost Artifacts",
  "Famous Heists",
  "Cults & Secret Societies",
  "Titanic History",
  "Las Vegas History",
  "Hollywood History",
  "British Royal Family",
  "Presidential History",

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSICAL INSTRUMENTS (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Piano & Keyboard History",
  "Guitar Types & Techniques",
  "Violin & String Instruments",
  "Drums & Percussion",
  "Synthesizers & Electronic Music",
  "Brass Instruments",
  "Woodwind Instruments",
  "Traditional World Instruments",

  // ═══════════════════════════════════════════════════════════════════════════
  // FASHION & STYLE (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Coco Chanel",
  "Fashion Through the Decades",
  "Streetwear Culture",
  "Luxury Fashion Houses",
  "Sneaker Culture",
  "Fashion Week & Runway",
  "Vintage & Retro Fashion",
  "Sustainable Fashion",

  // ═══════════════════════════════════════════════════════════════════════════
  // DRINK & BEVERAGE (6)
  // ═══════════════════════════════════════════════════════════════════════════
  "Whiskey & Bourbon",
  "Wine Regions & Varietals",
  "Coffee Origins & Brewing",
  "Tea Traditions",
  "Champagne & Sparkling Wine",
  "Tequila & Mezcal",

  // ═══════════════════════════════════════════════════════════════════════════
  // SPACE & ASTRONOMY SPECIFIC (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Black Holes & Cosmic Phenomena",
  "Mars Exploration",
  "The Solar System",
  "Famous Astronomers",
  "Space Shuttle Program",
  "International Space Station",
  "Exoplanets & Alien Worlds",
  "Constellations & Star Maps",

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMALS SPECIFIC (8)
  // ═══════════════════════════════════════════════════════════════════════════
  "Dogs & Dog Breeds",
  "Cats & Cat Breeds",
  "Sharks & Ocean Predators",
  "Big Cats & Wild Felines",
  "Primates & Apes",
  "Endangered Species",
  "Venomous Animals",
  "Prehistoric Animals",

  // ═══════════════════════════════════════════════════════════════════════════
  // CARS & VEHICLES (6)
  // ═══════════════════════════════════════════════════════════════════════════
  "Classic Cars",
  "Formula 1 Racing",
  "Muscle Cars",
  "Motorcycles",
  "Luxury Automobiles",
  "Electric Vehicles",

  // ═══════════════════════════════════════════════════════════════════════════
  // TRUE CRIME & MYSTERY (6)
  // ═══════════════════════════════════════════════════════════════════════════
  "Serial Killers",
  "Cold Cases",
  "True Crime Documentaries",
  "Famous Criminals",
  "Prison History",
  "Forensic Science",

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL CATEGORIES (remaining to reach 365)
  // ═══════════════════════════════════════════════════════════════════════════
  "Disney Movies & Characters",
  "Pixar Films",
  "Studio Ghibli",
  "DreamWorks Animation",
  "WWE & Professional Wrestling",
  "UFC & MMA",
  "Boxing History",
  "Chess",
  "Poker & Card Games",
  "Broadway Musicals",
  "Opera",
  "Ballet & Dance",
  "Sculpture & 3D Art",
  "Graffiti & Urban Art",
  "Digital Art & NFTs",
  "Interior Design",
  "Landscaping & Gardens",
  "Trains & Railways",
  "Ships & Sailing",
  "Submarines & Deep Sea",
  "Helicopters & Rotorcraft",
  "Drones & UAVs",
  "Robotics",
  "3D Printing",
  "Virtual Reality",
  "Augmented Reality",
  "Podcasting History",
  "YouTube & Content Creators",
  "TikTok & Short Form Video",
  "Twitch & Livestreaming",
  "Esports",
  "Speedrunning",
  "Retro Gaming",
  "Mobile Gaming",
  "Indie Games",
  "Game Development",
  "Animation History",
  "Voice Acting",
  "Film Directors",
  "Screenwriting",
  "Cinematography",
  "Film Scores & Soundtracks",
  "Horror Films",
  "Comedy Films",
  "Action Movies",
  "Romantic Comedies",
  "Documentaries",
  "Foreign Films",
  "Silent Film Era",
  "Golden Age of Hollywood",
  "New Hollywood Era",
  "Blockbuster Era",
] as const;

export type Category = typeof CATEGORIES[number];
