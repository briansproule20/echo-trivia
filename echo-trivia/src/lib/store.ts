// Zustand store for Trivia Wizard

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlaySettings, Session, Quiz } from "./types";

interface BuilderState {
  settings: Partial<PlaySettings>;
  manualQuestions: Quiz["questions"];
  setSettings: (settings: Partial<PlaySettings>) => void;
  addManualQuestion: (question: Quiz["questions"][0]) => void;
  removeManualQuestion: (id: string) => void;
  clearManualQuestions: () => void;
}

interface PlayState {
  currentSession: Session | null;
  currentQuestionIndex: number;
  isPaused: boolean;
  setSession: (session: Session, preserveIndex?: boolean) => void;
  setQuestionIndex: (index: number) => void;
  addSubmission: (submission: Session["submissions"][0]) => void;
  togglePause: () => void;
  endSession: () => void;
  clearSession: () => void;
}

interface UIState {
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  settings: {
    category: "General Knowledge",
    numQuestions: 10,
    difficulty: "mixed",
    type: "mixed",
    style: "classic",
  },
  manualQuestions: [],
  setSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),
  addManualQuestion: (question) =>
    set((state) => ({
      manualQuestions: [...state.manualQuestions, question],
    })),
  removeManualQuestion: (id) =>
    set((state) => ({
      manualQuestions: state.manualQuestions.filter((q) => q.id !== id),
    })),
  clearManualQuestions: () => set({ manualQuestions: [] }),
}));

export const usePlayStore = create<PlayState>((set) => ({
  currentSession: null,
  currentQuestionIndex: 0,
  isPaused: false,
  setSession: (session, preserveIndex = false) => set((state) => ({
    currentSession: session,
    // Only restore question index on initial load, not on updates during play
    currentQuestionIndex: preserveIndex ? state.currentQuestionIndex : session.submissions.length
  })),
  setQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  addSubmission: (submission) =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            submissions: [...state.currentSession.submissions, submission],
          }
        : null,
    })),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  endSession: () =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            endedAt: new Date().toISOString(),
            score: state.currentSession.submissions.filter((s) => s.correct).length,
          }
        : null,
    })),
  clearSession: () => set({ currentSession: null, currentQuestionIndex: 0, isPaused: false }),
}));

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Avatar type (used in quiz preferences)
export type AvatarId = "skull" | "ghost" | "cat" | "swords" | "shield" | "target" | "glasses" | "tree" | "flame" | "zap" | "crown" | "anchor" | "bird" | "bug" | "snowflake" | "cherry";

// Font preferences
export type FontFamily = "sans" | "serif" | "dyslexic" | "tech";

interface FontState {
  font: FontFamily;
  setFont: (font: FontFamily) => void;
}

export const useFontStore = create<FontState>()(
  persist(
    (set) => ({
      font: "sans",
      setFont: (font) => set({ font }),
    }),
    {
      name: "trivia-wizard-font",
    }
  )
);

// Quiz preferences
export type Difficulty = "easy" | "medium" | "hard" | "mixed";
export type QuestionCount = 5 | 10;
export type ExplanationTiming = "after_each" | "at_end";
export type Tone = "scholarly" | "playful" | "cinematic" | "pub_quiz" | "deadpan" | "sports_banter";
export type ExplanationStyle = "one_line_fact" | "compare_contrast" | "mini_story" | "why_wrong";

interface QuizPreferencesState {
  difficulty: Difficulty;
  questionCount: QuestionCount;
  explanationTiming: ExplanationTiming;
  preferredTone: Tone | null;
  explanationStyle: ExplanationStyle | null;
  avatarId: AvatarId;
  setDifficulty: (difficulty: Difficulty) => void;
  setQuestionCount: (count: QuestionCount) => void;
  setExplanationTiming: (timing: ExplanationTiming) => void;
  setPreferredTone: (tone: Tone | null) => void;
  setExplanationStyle: (style: ExplanationStyle | null) => void;
  setAvatarId: (id: AvatarId) => void;
}

export const useQuizPreferencesStore = create<QuizPreferencesState>()(
  persist(
    (set) => ({
      difficulty: "mixed",
      questionCount: 5,
      explanationTiming: "after_each",
      preferredTone: null,
      explanationStyle: null,
      avatarId: "ghost",
      setDifficulty: (difficulty) => set({ difficulty }),
      setQuestionCount: (questionCount) => set({ questionCount }),
      setExplanationTiming: (explanationTiming) => set({ explanationTiming }),
      setPreferredTone: (preferredTone) => set({ preferredTone }),
      setExplanationStyle: (explanationStyle) => set({ explanationStyle }),
      setAvatarId: (avatarId) => set({ avatarId }),
    }),
    {
      name: "trivia-wizard-quiz-preferences",
    }
  )
);

