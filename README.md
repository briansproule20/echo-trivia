# Trivia Wizard 🧙‍♂️

## Summon your inner genius.

Daily trivia challenges, infinite customizable practice, and more.
An AI trivia platform built with Next.js, Merit System's Echo billing integration, and the Vercel AI SDK.

## Game Modes

- **Daily Quiz** - One deterministic daily challenge per day with category rotation (EST timezone)
- **Freeplay Mode** - AI-powered quizzes with infinite categories, replayability
- **Faceoff**- Challenge your friends to a trivia battle, facing the same 5 or 10 questions
- **Survival** - How many can you answer correctly in a row?
- **Jeopardy** - Our take on the most famous trivia game ever played... how high can you score?
- **Campaign** - Play through our entire array of categories at your own pace, aiding the Trivia Wizard in his battle against the Drift

## Features

- **Quiz History** - Review up to 20 past quiz sessions with full answer details
- **Results & Ranking** - Earn performance titles (120+ unique ranks across 6 tiers) and share your results
- **Answer Review** - Detailed explanations for every question with correct answer display
- **Recipe System** - Deterministic quiz generation for preset categories (infinite variety via seed-based recipes)
- **Custom Categories** - Ask about any topic with simplified AI generation
- **Performance Tracking** - Category-bazsed statistics stored locally
- **Share Feature** - Native share with emoji grids and referral codes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK + Echo LLM Provider
- **Billing**: Echo metered LLM usage
- **Storage**: IndexedDB (local quiz history)
- **Database**: Account Info, Stats, Achievements stored on Supabase
- **Hosting**: Vercel

## Quiz Generation: Seed → Recipe → LLM Pipeline

Trivia Wizard uses **two generation modes**:

### 1. Recipe System (Preset Categories Only)

For the 154 preset categories (History, Science, etc.), quizzes are generated deterministically:

**Seed Generation:**
- **Daily Quizzes**: `SHA256(date + category)` → Same recipe every time for that day/category
- **Practice Quizzes**: Random 32-byte hex seed → Unique recipe each time

**Recipe Building:**
A recipe is deterministically generated from the seed and includes:
- **Tone** (6 options): scholarly, playful, cinematic, pub_quiz, deadpan, sports_banter
- **Category Mix**: 4-6 related categories selected from preset
- **Question Types** (2-3 types): multiple_choice, true_false, fill_blank, ordering
- **Difficulty Curve** (3 patterns): ramp (gradual), wave (alternating), valley (easy middle)
- **Explanation Style**: one_line_fact, compare_contrast, mini_story, why_wrong

**LLM Generation:**
- Claude receives the recipe as strict constraints in the prompt
- Generates questions matching the specified tone, era, and difficulty progression
- The LLM **never decides config** - it only fills content based on the deterministic recipe
- JSON schema validation with automatic repair if malformed

**Permutation Space:** 10M+ possible recipes = infinite variety

### 2. Simple Generation (Custom Categories)

For custom user-entered topics (e.g., "Quantum Physics" or "1980s Movies"):
- **No recipe system** - bypasses the complexity
- Direct prompt with user's category, difficulty, and question count
- Still uses JSON schema and validation
- Faster generation, less constrained

**Why Two Modes?**
- **Preset categories**: Reproducible daily quizzes + consistent quality + infinite variety
- **Custom categories**: Flexibility to quiz on any topic without recipe overhead

## Categories

### Preset Categories (151)
History, Science, Geography, Literature, Art & Culture, Music, Movies & TV, Sports, Technology, Food & Drink, Mythology, Politics, Nature & Animals, Mathematics, Philosophy, Video Games, Space & Astronomy, Medicine & Health, Economics, Language & Linguistics & More!

**Note:** Custom categories can be anything you want!

## Question Configuration

### Question Types
- **Multiple Choice**: 3-5 options, one correct answer
- **True/False**: Binary choice with explanation
- **Short Answer**: Text input with AI-powered fuzzy matching (≥85% threshold)
- **Mixed**: Random mix of all types

### Difficulty Levels
- **Easy**: Accessible questions for casual players
- **Medium**: Moderate challenge
- **Hard**: Expert-level questions
- **Mixed**: Dynamic difficulty throughout quiz

### Question Counts
- **5 questions**: Quick quiz (~2-3 minutes)
- **10 questions**: Standard quiz (~5-7 minutes)

## Performance Ranking System

After each quiz, you earn a **title** based on your score percentage:

**6 Performance Tiers** (120+ unique titles):
- **Disaster Zone** (0-19%): "Complete Catastrophe", "Absolute Trainwreck", etc.
- **Needs Work** (20-49%): "Rough Start", "Room for Improvement", etc.
- **Not Bad** (50-69%): "Decent Effort", "Getting There", etc.
- **Pretty Good** (70-84%): "Well Done", "Impressive Performance", etc.
- **Excellent** (85-99%): "Outstanding", "Near Perfect", etc.
- **Absolute Perfection** (100%): "Flawless Victory", "Perfect Score", etc.

Titles are randomly selected from the tier pool to add variety to repeated plays.

## Echo Integration

The app uses **Echo** (by Merit Systems) for authentication and metered AI billing.

### Features:
- **User Authentication**: Echo React SDK with sign-in/sign-out
- **Metered LLM Billing**: Pay-per-use AI generation (transparent cost tracking)
- **Balance Display**: Real-time account balance in UI
- **Top-Up**: Quick links to add credits
- **Referral System**: User IDs included in share messages

### AI Model:
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`)
- Accessed via Echo's `anthropic()` provider
- Wrapped with Vercel AI SDK's `generateText()`

### Echo Endpoints:
- **Quiz Generation** (`/api/trivia/generate`): Metered through Echo
- **Answer Evaluation** (`/api/trivia/evaluate`): Metered through Echo (fuzzy matching only)

All LLM calls are tracked and billed through Echo's platform.

## Roadmap

Future enhancements being considered:
- [ ] Image-based questions
- [ ] Audio/video question support
- [ ] Timed speedrun mode
- [ ] Quiz templates & presets
- [ ] Export/Import quiz JSON
- [ ] Leveling Sytem

Adaptive Difficulty Engine
- Quizzes learn from player performance and dynamically adjust question difficulty.

Category Mastery Paths
- Mini “skill trees” where players unlock harder tiers in topics as they excel.

“Boss Questions”
- End-of-quiz ultra-hard question that gives bonus XP or a special badge.

Progressive Hints
- Tiered hint system: word reveal → elimination → full explanation.

Profile Badges
- Achievement-based icons (e.g., “History Master”, “Perfectionist 10×”).

Community Packs/Pacts
- Curated pacts made by influencers/experts (e.g., “Physicist Pack”).
  
LLM Cross-Verification
- A second pass to verify answer accuracy using another model or endpoint.

Explain-Like-I’m-5 Mode
- Auto-generate simpler explanations for accessibility.

“Continue the Lesson” Mode
- After a quiz, users get a short mini-lesson expanding on the questions.

Trivia Tutor
- Chat mode where the AI can drill you on weak areas or generate follow-ups.

Full Player Profile System
- XP, levels, ranks, badges, and category mastery metrics.

Pack Store (Free)
- Add thematic quiz packs:
- 90s Nostalgia
- World Mythologies
- NBA Legends
- Startups & Tech
- US History AP Level

Expert Packs (Paid or Referral Unlocks)
- Unlock premium or special packs with referrals or Echo credits.

Curriculum Mode:
- AP/IB-style structured practice sets (English, History, Bio)
  
Offline Mode
- Caches recipes and quizzes for offline play in PWA mode.

## License

MIT
