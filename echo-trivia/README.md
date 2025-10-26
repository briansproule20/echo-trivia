# Echo Trivia / Trivia Wizard 🧙‍♂️

An AI-powered trivia game built with Next.js 15, featuring dynamic question generation, performance rankings, achievements, and metered LLM billing through Echo.

## Features

### 🎮 Core Gameplay
- **AI-Generated Questions**: Dynamic trivia questions across 20+ categories
- **Multiple Question Types**: Multiple choice, true/false, and short answer
- **Difficulty Levels**: Easy, medium, and hard questions
- **Daily Challenges**: Seeded daily quizzes with shareable results
- **Performance Rankings**: 120+ unique titles across 6 tiers (Novice → Legendary)

### 👤 User Profiles & Progression
- **User Profiles**: Customizable username and comprehensive stats tracking
- **Dashboard**: Visual analytics with charts showing accuracy, category breakdown, and achievement progress
- **Achievements System**: 10 unique achievements across 4 tiers (Bronze → Platinum)
  - First Steps, Daily Devotee, Perfect Score, Streak Master, Century Club
  - Hard Mode Master, Quiz Marathon, Speed Demon, Knowledge Seeker, Perfectionist
- **Daily Streaks**: Track consecutive daily quiz completions
- **Global Leaderboard**: Top 25 players ranked by average quiz score

### 🎯 Quiz Modes

#### Recipe Mode (Daily Challenges)
- Deterministic quiz generation using seed-based variety
- Same questions for all users on a given day
- Shareable results with difficulty indicators and score breakdown
- Two-row emoji format: 🟢🟦⬛ (difficulty) + ✅❌ (results)

#### Practice Mode
- Customizable quiz settings:
  - Category selection (20 preset categories + custom)
  - Number of questions (5-25)
  - Difficulty level (easy, medium, hard, or mixed)
  - Question type (multiple choice, true/false, short answer, or mixed)
- Instant feedback on answers
- Performance title awarded based on score

### 📊 Data & Analytics
- **Local Storage**: IndexedDB for fast access to recent sessions, favorites, and stats
- **Cloud Backend**: Supabase PostgreSQL for persistent user data
- **Real-time Stats**: Quizzes played, accuracy percentage, category breakdown
- **Session History**: Review past quiz results and answers

### 💰 Metered Billing
- Powered by [Echo](https://www.merit.systems) for pay-per-use LLM access
- No subscription required - only pay for what you use
- Built-in referral system with shareable links

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix primitives)
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **AI**: Vercel AI SDK + Anthropic Claude
- **State Management**: Zustand
- **Charts**: Recharts
- **Storage**: IndexedDB (client) + Supabase (server)
- **Authentication**: Echo SDK
- **Deployment**: Vercel

## Categories

Science, History, Geography, Literature, Movies, Music, Sports, Technology, Art, Food, Animals, Space, Medicine, Politics, Mathematics, Philosophy, Mythology, Video Games, Fashion, Architecture, and more.

Custom categories can be created on-the-fly using the practice mode.

## Performance Tiers

Your quiz results earn you a rank from one of 120+ unique titles:

- **Novice** (0-20%): Getting Started
- **Apprentice** (21-40%): Learning the Ropes
- **Adept** (41-60%): Competent Knowledge
- **Expert** (61-80%): Strong Performance
- **Master** (81-95%): Exceptional Mastery
- **Legendary** (96-100%): Perfect Execution

## Database Schema

### Tables
- **users**: User profiles with customizable usernames
- **quiz_sessions**: Completed quiz history with scores and metadata
- **achievements**: 10 achievement definitions with tiers
- **user_achievements**: Earned achievements per user
- **daily_streaks**: Consecutive daily quiz completion tracking

### Automatic Features
- Achievement awarding happens automatically after every quiz
- Daily streak updates on daily challenge completion
- Retroactive achievement grants based on existing quiz history

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (for backend features)
- Echo API key (for metered billing)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your credentials to .env.local:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - POSTGRES_URL
# - NEXT_PUBLIC_ECHO_CLIENT_ID

# Run database migrations (see supabase/SAFE_TO_RUN_ANYTIME.sql)

# Start development server
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the initial schema: `supabase/migrations/001_initial_schema.sql`
3. Add achievements: `supabase/SAFE_TO_RUN_ANYTIME.sql` (safe to run multiple times)

## Architecture

### Client-Side Storage (IndexedDB)
- **20 most recent sessions**: Fast access to recent quiz results
- **10 daily quizzes**: Cached daily challenges
- **50 favorite categories**: Quick category access
- **User stats**: Aggregated performance metrics

### Server-Side Storage (Supabase)
- **Persistent user data**: Profiles, achievements, streaks
- **Global leaderboard**: Cross-user rankings
- **Quiz history**: Complete session records for analytics
- **Row Level Security**: Users can only access their own data

### Quiz Generation Flow
1. User configures quiz settings (category, difficulty, count, type)
2. Settings sent to AI model with system prompts
3. Claude generates questions in structured format
4. Questions validated and formatted
5. Quiz presented to user with interactive UI
6. Results saved to both IndexedDB and Supabase
7. Achievements automatically checked and awarded

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (trivia)/          # Quiz-related pages
│   │   ├── daily/         # Daily challenge
│   │   ├── practice/      # Practice mode
│   │   ├── play/          # Quiz gameplay
│   │   ├── results/       # Results review
│   │   ├── dashboard/     # User dashboard
│   │   ├── leaderboard/   # Global rankings
│   │   └── profile/       # User profile
│   └── api/               # API routes
│       ├── quiz/          # Quiz generation & submission
│       ├── achievements/  # Achievement endpoints
│       ├── leaderboard/   # Leaderboard data
│       └── users/         # User management
├── components/            # React components
│   ├── trivia/           # Quiz-specific components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and helpers
│   ├── storage.ts        # IndexedDB wrapper
│   ├── types.ts          # TypeScript types
│   ├── quiz-utils.ts     # Quiz generation logic
│   └── supabase-types.ts # Database types
├── utils/                # Third-party integrations
│   └── supabase/         # Supabase client configs
└── store/                # Zustand state stores

supabase/
├── migrations/           # SQL schema migrations
└── SAFE_TO_RUN_ANYTIME.sql  # Idempotent achievement setup
```

## Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue.

## License

MIT

## Acknowledgments

- Powered by [Echo](https://www.merit.systems) for metered AI billing
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI models from [Anthropic](https://www.anthropic.com)
- Backend by [Supabase](https://supabase.com)
