# Trivia Wizard 🧙‍♂️

An AI-powered trivia platform built with Next.js, Echo billing integration, and the Vercel AI SDK.

## Features

- **Daily Quiz** - One curated quiz per day with deterministic seeding
- **Practice Mode** - Customize category, difficulty, question type, and style
- **Quiz Builder** - Create custom quizzes manually or with AI assistance
- **Interactive Play** - Beautiful quiz runner with timer, progress tracking, and keyboard shortcuts
- **Results & Review** - Detailed scoring, explanations, and performance tracking

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK + Echo LLM Provider
- **Billing**: Echo metered LLM usage
- **State**: Zustand
- **Validation**: Zod
- **Storage**: LocalStorage (with optional DB support)

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
│   ├── storage.ts         # LocalStorage utilities
│   └── quiz-utils.ts      # Quiz helpers
└── echo/
    └── index.ts           # Echo SDK setup
```

## API Routes

### POST /api/trivia/generate
Generate quiz questions using AI.

**Request:**
```json
{
  "settings": {
    "category": "Science",
    "numQuestions": 10,
    "difficulty": "mixed",
    "type": "mixed",
    "style": "classic"
  }
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

## Features to Implement (Optional)

- [ ] Leaderboard (local & server)
- [ ] Image-based questions
- [ ] Quiz marketplace/templates
- [ ] Export/Import quiz JSON
- [ ] Multiplayer mode
- [ ] Achievement system

## License

MIT
