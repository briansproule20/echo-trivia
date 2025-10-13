# EchoTrivia
Test your wits. Bend the algorithm.

_A modern AI-powered trivia platform built on Echo._

**EchoTrivia** is a full-featured trivia experience powered by the Merit System's Echo Infrastructure — blending intelligence, design, and replayable daily challenges. Choose your categories, customize quizzes, or let the AI craft perfect brain workouts.

---

## 🧠 Features

### 🎯 Home
- Browse curated trivia categories
- Continue your last game or jump into the Daily Quiz
- Track your progress and streaks

### 🌅 Daily Quiz
- New quiz every day, generated via Echo’s LLM seed logic
- Share scores and challenge friends

### 🧩 Practice Mode
- Choose your difficulty, question type, and timer
- Instant feedback and explanations

### ⚙️ Trivia Builder
- Create quizzes manually or with AI assistance
- Save, edit, and export trivia packs

---

## 🧰 Stack

- **Framework:** Next.js (App Router, TypeScript)
- **UI:** Tailwind + shadcn/ui
- **AI Backend:** Echo + Vercel AI SDK
- **State:** Zustand
- **Validation:** Zod
- **Optional DB:** Drizzle + SQLite (leaderboards, history)

---

## 🎨 Design Language
A minimal, high-contrast interface inspired by Echo’s core aesthetic:
- Deep matte onyx backgrounds
- Amber-gold accents for intellect
- Cobalt blue for interactive focus
- Smooth transitions, tactile feedback, and dark elegance

---

## 🚀 Getting Started

```bash
pnpm install
pnpm dev
