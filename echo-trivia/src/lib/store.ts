// Zustand store for Trivia Wizard

import { create } from "zustand";
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
  setSession: (session: Session) => void;
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
  setSession: (session) => set({ currentSession: session, currentQuestionIndex: 0 }),
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

