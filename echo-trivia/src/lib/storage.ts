// LocalStorage utilities for Trivia Wizard

import type { Session, Quiz } from "./types";

const MAX_SESSIONS = 20;

export const storage = {
  // Sessions
  saveSession: (session: Session) => {
    if (typeof window === "undefined") return;
    
    const sessions = storage.getSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
      if (sessions.length > MAX_SESSIONS) {
        sessions.pop();
      }
    }
    
    localStorage.setItem("trivia-sessions", JSON.stringify(sessions));
  },

  getSession: (id: string): Session | null => {
    if (typeof window === "undefined") return null;
    
    const sessions = storage.getSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  getSessions: (): Session[] => {
    if (typeof window === "undefined") return [];
    
    try {
      const data = localStorage.getItem("trivia-sessions");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Daily quiz cache
  saveDailyQuiz: (date: string, quiz: Quiz) => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem(`daily-quiz-${date}`, JSON.stringify(quiz));
  },

  getDailyQuiz: (date: string): Quiz | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const data = localStorage.getItem(`daily-quiz-${date}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Favorites
  saveFavoriteQuiz: (quiz: Quiz) => {
    if (typeof window === "undefined") return;
    
    const favorites = storage.getFavoriteQuizzes();
    const existingIndex = favorites.findIndex((q) => q.id === quiz.id);
    
    if (existingIndex < 0) {
      favorites.unshift(quiz);
      localStorage.setItem("trivia-favorites", JSON.stringify(favorites));
    }
  },

  getFavoriteQuizzes: (): Quiz[] => {
    if (typeof window === "undefined") return [];
    
    try {
      const data = localStorage.getItem("trivia-favorites");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  removeFavoriteQuiz: (id: string) => {
    if (typeof window === "undefined") return;
    
    const favorites = storage.getFavoriteQuizzes();
    const filtered = favorites.filter((q) => q.id !== id);
    localStorage.setItem("trivia-favorites", JSON.stringify(filtered));
  },

  // Analytics
  trackCategoryPerformance: (category: string, correct: number, total: number) => {
    if (typeof window === "undefined") return;
    
    const stats = storage.getCategoryStats();
    if (!stats[category]) {
      stats[category] = { correct: 0, total: 0 };
    }
    stats[category].correct += correct;
    stats[category].total += total;
    localStorage.setItem("trivia-stats", JSON.stringify(stats));
  },

  getCategoryStats: (): Record<string, { correct: number; total: number }> => {
    if (typeof window === "undefined") return {};
    
    try {
      const data = localStorage.getItem("trivia-stats");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },
};

