# Trivia Wizard 🧙‍♂️

An AI-powered trivia platform with unlimited categories, cloud-synced history, and pay-per-use billing.

**[Play Now](https://trivwiz.com)** | **[Developer](https://www.fishmug.dev)**

---

## Features

### Core Gameplay
- **AI-Generated Questions** - Unlimited trivia on 150+ preset categories or any custom topic
- **Multiple Question Types** - Multiple choice, true/false, and short answer with fuzzy matching
- **Difficulty Levels** - Easy, medium, hard, or mixed
- **Performance Rankings** - 120+ unique titles across 6 tiers based on your score

### Game Modes
- **Daily Challenge** - One deterministic quiz per day with category rotation (same questions for everyone)
- **Practice Mode** - Unlimited custom quizzes with full control over settings
- **Faceoff Mode** - Challenge friends with shareable quiz links

### Progression System
- **Achievements** - 11 achievements across 4 tiers (Bronze → Platinum)
- **Daily Streaks** - Track consecutive daily completions (up to 30-day Streak Legend)
- **Skill Index (ELO)** - Competitive ranking based on performance and difficulty
- **Global Leaderboards** - Daily, all-time, and skill-based rankings

### Cloud Sync
- **Cross-Device History** - Quiz history syncs across all your devices
- **Full Question Review** - Review every question, answer, and explanation from past quizzes
- **Persistent Progress** - Achievements, streaks, and stats never lost

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **AI** | Vercel AI SDK + Anthropic Claude |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth & Billing** | Echo (Merit Systems) |
| **Hosting** | Vercel |

---

## Quiz Generation

Trivia Wizard uses a **Recipe System** for deterministic, reproducible quizzes:

### How It Works
1. **Seed Generation** - Daily quizzes use `SHA256(date + category)`, practice uses random seeds
2. **Recipe Building** - Seed determines tone, category mix, question types, difficulty curve
3. **LLM Generation** - Claude fills content based on the deterministic recipe
4. **Validation** - JSON schema validation with automatic repair

### Recipe Components
- **Tone** (6 options): scholarly, playful, cinematic, pub_quiz, deadpan, sports_banter
- **Difficulty Curve** (3 patterns): ramp, wave, valley
- **Question Types**: multiple_choice, true_false, fill_blank, ordering

**Result:** 10M+ possible recipe combinations = infinite variety with reproducibility.

---

## Storage Architecture

### Cloud-First Design (Supabase)
All user data syncs to the cloud when signed in:

| Table | Purpose |
|-------|---------|
| `users` | Profiles with usernames and preferences |
| `quiz_sessions` | Complete quiz history with scores and metadata |
| `quiz_questions` | Full question data for history review |
| `quiz_submissions` | User answers for each question |
| `achievements` | 11 achievement definitions |
| `user_achievements` | Earned achievements per user |
| `daily_streaks` | Consecutive completion tracking |

**Security:** Row Level Security ensures users only access their own data.

---

## Project Structure

```
src/
├── app/
│   ├── (trivia)/           # Quiz pages (daily, practice, play, results, history)
│   ├── (docs)/             # Documentation pages (settings, getting-started, faqs)
│   └── api/
│       ├── quiz/           # Generation, submission, history endpoints
│       ├── leaderboard/    # Rankings (daily, all-time, ELO)
│       ├── achievements/   # Achievement endpoints
│       └── user/           # Profile management
├── components/
│   ├── trivia/             # Quiz-specific components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── storage.ts          # Storage API
│   ├── quiz-utils.ts       # Quiz helpers, title generation
│   ├── recipe.ts           # Recipe system
│   └── types.ts            # TypeScript types
└── supabase/
    └── migrations/         # Database schema
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Echo API credentials

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Required variables:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# NEXT_PUBLIC_ECHO_CLIENT_ID

# Run migrations
npx supabase db push

# Start dev server
npm run dev
```

---

## API Reference

### Quiz Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/generate` | Generate quiz questions |
| POST | `/api/quiz/submit` | Submit completed quiz |
| GET | `/api/quiz/history` | Get user's quiz history |
| GET | `/api/quiz/history/[id]` | Get specific session with questions |

### Leaderboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | All-time rankings |
| GET | `/api/leaderboard/daily` | Daily rankings |
| GET | `/api/leaderboard/elo` | Skill Index rankings |

---

## Performance Tiers

| Tier | Score | Example Titles |
|------|-------|----------------|
| **Disaster Zone** | 0-19% | "Complete Catastrophe", "Absolute Trainwreck" |
| **Needs Work** | 20-49% | "Rough Start", "Room for Improvement" |
| **Not Bad** | 50-69% | "Decent Effort", "Getting There" |
| **Pretty Good** | 70-84% | "Well Done", "Impressive Performance" |
| **Excellent** | 85-99% | "Outstanding", "Near Perfect" |
| **Perfection** | 100% | "Flawless Victory", "Perfect Score" |

---

## Echo Integration

Powered by **[Echo](https://www.merit.systems)** for authentication and metered AI billing:

- **Pay-Per-Use** - No subscriptions, only pay for what you use (~$0.02 per quiz)
- **Transparent Billing** - Real-time balance tracking
- **Referral Program** - Earn 10% from users you refer

---

## Roadmap

### In Progress
- [ ] Image-based questions
- [ ] Timed speedrun mode
- [ ] Category mastery paths

### Planned
- [ ] Boss questions (bonus XP challenges)
- [ ] Progressive hint system
- [ ] Community quiz packs
- [ ] PWA with offline mode
- [ ] Accessibility improvements (large text, dyslexia font, colorblind palette)

---

## License

MIT

---

## Acknowledgments

- **[Echo](https://www.merit.systems)** - Metered AI billing
- **[shadcn/ui](https://ui.shadcn.com)** - UI components
- **[Anthropic](https://www.anthropic.com)** - Claude AI
- **[Supabase](https://supabase.com)** - Database & auth
- **[Vercel](https://vercel.com)** - Hosting
