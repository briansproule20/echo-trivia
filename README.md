# Trivia Wizard 🧙‍♂️

An AI-powered trivia platform built with Next.js, Echo billing integration, and the Vercel AI SDK.

## Features

- **Daily Quiz** - One deterministic daily challenge per day with category rotation (EST timezone)
- **Practice Mode** - Unlimited AI-powered quizzes with infinite categories
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

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# .env.local
ECHO_APP_ID=your_echo_app_id
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (trivia)/
│   │   ├── daily/              # Daily quiz configuration
│   │   ├── practice/           # Practice mode quiz builder
│   │   ├── play/[sessionId]/   # Interactive quiz gameplay
│   │   ├── results/[sessionId]/ # Score review & sharing
│   │   ├── history/            # Past quiz sessions
│   │   ├── getting-started/    # Onboarding guide
│   │   └── faqs-and-docs/      # Help & documentation
│   ├── api/
│   │   ├── echo/[...echo]/     # Echo auth routes
│   │   └── trivia/
│   │       ├── generate/       # LLM question generation (recipe system)
│   │       ├── evaluate/       # Answer evaluation (fuzzy matching)
│   │       └── daily/          # Daily quiz endpoint (24hr cache)
│   ├── _components/            # App-level components (header, echo UI)
│   └── page.tsx                # Home page (quick actions + recent history)
├── components/
│   ├── trivia/                 # Trivia-specific components
│   │   ├── QuestionCard.tsx    # Question display
│   │   ├── BuilderForm.tsx     # Quiz customization
│   │   ├── CategoryPills.tsx   # Category selection
│   │   ├── ProgressBar.tsx     # Quiz progress
│   │   ├── ScoreBanner.tsx     # Score display
│   │   └── Navbar.tsx          # Navigation
│   └── ui/                     # shadcn/ui components (20+ components)
├── lib/
│   ├── types.ts                # TypeScript types & interfaces
│   ├── schemas.ts              # Zod schemas for validation
│   ├── store.ts                # Zustand stores (play, builder, UI)
│   ├── db.ts                   # IndexedDB wrapper (4 stores)
│   ├── storage.ts              # Storage API singleton
│   ├── quiz-utils.ts           # Quiz helpers, seeding, title generation
│   ├── rand.ts                 # Deterministic randomness utilities
│   └── recipe.ts               # Recipe system (enums, builder, seed→recipe)
└── echo/
    └── index.ts                # Echo SDK setup (auth + metered LLM)
```

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

## API Routes

### POST /api/trivia/generate
Generate quiz questions using AI with recipe system.

**Request:**
```json
{
  "settings": {
    "category": "Science",
    "numQuestions": 10,
    "difficulty": "mixed",
    "type": "mixed"
  },
  "dailyDate": "2025-10-17"  // Optional: for deterministic daily quizzes
}
```

### POST /api/trivia/evaluate
Evaluate an answer (with fuzzy matching for short answers).

**Request:**
```json
{
  "question": { /* Question object */ },
  "response": "user answer"
}
```

### GET /api/trivia/daily?date=YYYY-MM-DD
Get the deterministic daily quiz for a given date.

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

## Storage & Data Management

The app uses **IndexedDB** exclusively for client-side storage (no localStorage):

### 4 Object Stores:

| Store | Purpose | Max Items | Key |
|-------|---------|-----------|-----|
| **sessions** | Complete quiz sessions with answers, submissions, and metadata | 20 (auto-trimmed) | `id` |
| **daily_quizzes** | Cached daily challenges by date | Unlimited | `date` |
| **favorites** | User-saved favorite quizzes | Unlimited | `id` |
| **stats** | Category performance tracking (correct/total) | Per-category | `category` |

### Storage Features:
- **Async API**: Non-blocking operations for better performance
- **Auto-trimming**: Automatically keeps only the 20 most recent sessions
- **Indexed queries**: Fast sorting by `startedAt` timestamp
- **Large capacity**: 50MB+ storage (vs 5-10MB for localStorage)
- **Type-safe wrapper**: Singleton `storage` object with TypeScript support

### Storage API:
```typescript
// Sessions
storage.saveSession(session)
storage.getSession(id)
storage.getSessions()        // Returns latest 20, sorted
storage.deleteSession(id)
storage.deleteAllSessions()

// Stats
storage.trackCategoryPerformance(category, correct, total)
storage.getCategoryStats()
```

## Additional Features

### Share Results
After completing a quiz, share your performance:
- **Emoji Grid**: Visual representation (🟢 = correct, 🔴 = incorrect)
- **Score & Title**: Displays your rank and percentage
- **Referral Code**: Includes your Echo user ID
- **Native Share API**: Mobile-friendly sharing with clipboard fallback

Example share message:
```
I received the rank of "Impressive Performance" on Trivia Wizard!

Score: 8/10 (80%)
Category: Science

🟢🟢🟢🟢🟢🔴🟢🔴🟢🟢

Try it yourself: [link] (ref: user_abc123)
```

### Daily Quiz
- **New challenge daily** at midnight EST
- **Category rotation**: Deterministic hash-based selection from 20 categories
- **Cached for 24 hours**: Same quiz for all users on the same day
- **Shareable**: Compare scores with friends

### History & Stats
- **Session History**: View up to 20 past quizzes with full details
- **Filter & Search**: Find specific quiz sessions
- **Delete Options**: Remove individual sessions or clear all
- **Performance Stats**: Track accuracy by category over time

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

Model Swapping
- Allow users to pick “Fast (cheap)” vs. “Deep (expensive)” LLM generation modes.

Full Player Profile System
- XP, levels, ranks, badges, and category mastery metrics.

Insights Dashboard Enhancement
Visualizations:
- heatmap of accuracy by category
- “knowledge gaps” chart
- accuracy over time
- best/worst topics
- streaks + milestones

Skill Index Leaderboard
- A global ELO-like score based on quiz difficulty + performance.

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

PWA Installable App
- Fully badge-able, themed, and with push notifications.

Accessibility Improvements
- Large text mode
- Dyslexia-friendly font
- Colorblind palette switch
- Keyboard-only mode

Authentication & Account Enhancements
Supabase Profile Sync
- Sync history, favorites, stats, and settings across devices. This will require a rework of the current hybrid storage model...
Referral Dashboard
- View total referrals, credit earned, and revenue stats (This can be seen on Echo, direct there)

## License

MIT
