# Trivia Wizard 🧙‍♂️

An AI-powered trivia platform built with Next.js, Echo billing integration, and the Vercel AI SDK.

## Features

- **Daily Quiz** - One curated quiz per day with deterministic category rotation
- **Practice Mode** - Customize category, difficulty, question type, and style
- **Results & Review** - Detailed scoring, explanations, and performance tracking
- **Recipe System** - Deterministic quiz generation with configurable variety (tone, era, region, difficulty curves)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK + Echo LLM Provider
- **Billing**: Echo metered LLM usage
- **State**: Zustand
- **Validation**: Zod
- **Storage**: IndexedDB (for sessions, quizzes, stats)

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
│   │   ├── daily/          # Daily quiz page
│   │   ├── practice/       # Practice mode
│   │   ├── builder/        # Quiz builder
│   │   ├── play/          # Quiz runner
│   │   └── results/       # Results page
│   ├── api/
│   │   ├── echo/          # Echo auth routes
│   │   └── trivia/        # Trivia API routes
│   │       ├── generate/  # LLM question generation
│   │       ├── evaluate/  # Answer evaluation
│   │       └── daily/     # Daily quiz endpoint
│   └── page.tsx           # Home page
├── components/
│   ├── trivia/            # Trivia-specific components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── types.ts           # TypeScript types
│   ├── schemas.ts         # Zod schemas
│   ├── store.ts           # Zustand stores
│   ├── db.ts              # IndexedDB wrapper
│   ├── storage.ts         # Storage API (exports from db.ts)
│   ├── quiz-utils.ts      # Quiz helpers & title generation
│   ├── rand.ts            # Deterministic randomness utilities
│   └── recipe.ts          # Recipe system (enums, builder)
└── echo/
    └── index.ts           # Echo SDK setup
```

## Quiz Generation: Seed → Recipe → LLM Pipeline

Trivia Wizard uses a deterministic recipe system for quiz generation:

1. **Seed Generation**
   - **Daily Quizzes**: Deterministic seed based on `date + category` (same inputs = same recipe)
   - **Practice Quizzes**: Random 32-byte seed (unique recipe every time)

2. **Recipe Building**
   A recipe is deterministically generated from the seed and includes:
   - **Tone**: scholarly, playful, cinematic, pub_quiz, deadpan, sports_banter
   - **Era**: ancient, medieval, early_modern, modern, contemporary, mixed
   - **Difficulty Curve**: 3 predefined patterns (ramp, wave, valley)
   - **Distractor Styles**: close_shaves, same_category, temporal_confusion, numerical_nearby
   - **Explanation Style**: one_line_fact, compare_contrast, mini_story, why_wrong

3. **LLM Generation**
   The LLM receives the recipe as constraints and generates questions matching the specified tone, era, and difficulty progression. The LLM **never decides config** - it only fills content based on the deterministic recipe.

**Why this approach?**
- Daily quizzes are reproducible (same recipe for the same day's challenge)
- Practice quizzes have infinite variety (random recipes)
- No free-form config strings - all parameters are predefined enums
- Large permutation space ensures unique quiz experiences

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

## Question Types

- **Multiple Choice**: 3-5 options, one correct
- **True/False**: Binary choice
- **Short Answer**: Text input with fuzzy matching

## Quiz Styles

- **Classic**: Standard quiz with no time limit
- **Speedrun**: Timed questions (configurable seconds per question)
- **Survival**: One wrong answer ends the quiz

## Echo Integration

The app uses Echo for:
- User authentication
- Metered LLM billing
- Token/balance display
- AI provider integration (GPT-4o)

All LLM calls go through Echo's metered API, ensuring transparent usage tracking.

## Storage

The app uses **IndexedDB** for client-side storage:
- **Sessions**: Last 20 quiz sessions with full history
- **Daily Quizzes**: Cached daily quizzes by date
- **Favorites**: Saved favorite quizzes
- **Stats**: Category performance tracking

IndexedDB provides:
- Better performance than localStorage
- Larger storage capacity (50MB+)
- Structured data storage
- Async API for non-blocking operations

## Features to Implement (Optional)

- [ ] Leaderboard (local & server)
- [ ] Image-based questions
- [ ] Quiz marketplace/templates
- [ ] Export/Import quiz JSON
- [ ] Multiplayer mode
- [ ] Achievement system

## License

MIT
