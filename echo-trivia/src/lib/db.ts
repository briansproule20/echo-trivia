// IndexedDB wrapper for Trivia Wizard

import type { Session, Quiz } from "./types";

const DB_NAME = "trivia-wizard-db";
const DB_VERSION = 1;

// Store names
const STORES = {
  SESSIONS: "sessions",
  DAILY_QUIZZES: "daily_quizzes",
  FAVORITES: "favorites",
  STATS: "stats",
} as const;

class TriviaDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("IndexedDB not available"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Sessions store
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: "id" });
          sessionStore.createIndex("createdAt", "startedAt", { unique: false });
        }

        // Daily quizzes store
        if (!db.objectStoreNames.contains(STORES.DAILY_QUIZZES)) {
          db.createObjectStore(STORES.DAILY_QUIZZES, { keyPath: "date" });
        }

        // Favorites store
        if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
          db.createObjectStore(STORES.FAVORITES, { keyPath: "id" });
        }

        // Stats store
        if (!db.objectStoreNames.contains(STORES.STATS)) {
          db.createObjectStore(STORES.STATS, { keyPath: "category" });
        }
      };
    });

    return this.initPromise;
  }

  // Sessions
  async saveSession(session: Session): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SESSIONS], "readwrite");
      const store = transaction.objectStore(STORES.SESSIONS);
      const request = store.put(session);

      request.onsuccess = () => {
        // Keep only the last 20 sessions
        this.trimSessions();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSession(id: string): Promise<Session | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SESSIONS], "readonly");
      const store = transaction.objectStore(STORES.SESSIONS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getSessions(): Promise<Session[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SESSIONS], "readonly");
      const store = transaction.objectStore(STORES.SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => {
        const sessions = request.result || [];
        // Sort by startedAt descending
        sessions.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
        resolve(sessions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SESSIONS], "readwrite");
      const store = transaction.objectStore(STORES.SESSIONS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAllSessions(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SESSIONS], "readwrite");
      const store = transaction.objectStore(STORES.SESSIONS);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async trimSessions(): Promise<void> {
    const sessions = await this.getSessions();
    if (sessions.length <= 20) return;

    const db = await this.init();
    const sessionsToDelete = sessions.slice(20);

    const transaction = db.transaction([STORES.SESSIONS], "readwrite");
    const store = transaction.objectStore(STORES.SESSIONS);

    for (const session of sessionsToDelete) {
      store.delete(session.id);
    }
  }

  // Daily quizzes
  async saveDailyQuiz(date: string, quiz: Quiz): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.DAILY_QUIZZES], "readwrite");
      const store = transaction.objectStore(STORES.DAILY_QUIZZES);
      const request = store.put({ date, quiz });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDailyQuiz(date: string): Promise<Quiz | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.DAILY_QUIZZES], "readonly");
      const store = transaction.objectStore(STORES.DAILY_QUIZZES);
      const request = store.get(date);

      request.onsuccess = () => resolve(request.result?.quiz || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Favorites
  async saveFavoriteQuiz(quiz: Quiz): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.FAVORITES], "readwrite");
      const store = transaction.objectStore(STORES.FAVORITES);
      const request = store.put(quiz);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFavoriteQuizzes(): Promise<Quiz[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.FAVORITES], "readonly");
      const store = transaction.objectStore(STORES.FAVORITES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFavoriteQuiz(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.FAVORITES], "readwrite");
      const store = transaction.objectStore(STORES.FAVORITES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Stats
  async trackCategoryPerformance(
    category: string,
    correct: number,
    total: number
  ): Promise<void> {
    const db = await this.init();
    const stats = await this.getCategoryStats();
    
    if (!stats[category]) {
      stats[category] = { correct: 0, total: 0 };
    }
    stats[category].correct += correct;
    stats[category].total += total;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.STATS], "readwrite");
      const store = transaction.objectStore(STORES.STATS);
      const request = store.put({
        category,
        correct: stats[category].correct,
        total: stats[category].total,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCategoryStats(): Promise<Record<string, { correct: number; total: number }>> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.STATS], "readonly");
      const store = transaction.objectStore(STORES.STATS);
      const request = store.getAll();

      request.onsuccess = () => {
        const stats: Record<string, { correct: number; total: number }> = {};
        for (const item of request.result || []) {
          stats[item.category] = { correct: item.correct, total: item.total };
        }
        resolve(stats);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
const db = new TriviaDB();

// Export storage interface that matches the old localStorage API
export const storage = {
  saveSession: (session: Session) => db.saveSession(session).catch(console.error),
  getSession: (id: string) => db.getSession(id).catch(() => null),
  getSessions: () => db.getSessions().catch(() => []),
  deleteSession: (id: string) => db.deleteSession(id).catch(console.error),
  deleteAllSessions: () => db.deleteAllSessions().catch(console.error),

  saveDailyQuiz: (date: string, quiz: Quiz) => db.saveDailyQuiz(date, quiz).catch(console.error),
  getDailyQuiz: (date: string) => db.getDailyQuiz(date).catch(() => null),

  saveFavoriteQuiz: (quiz: Quiz) => db.saveFavoriteQuiz(quiz).catch(console.error),
  getFavoriteQuizzes: () => db.getFavoriteQuizzes().catch(() => []),
  removeFavoriteQuiz: (id: string) => db.removeFavoriteQuiz(id).catch(console.error),

  trackCategoryPerformance: (category: string, correct: number, total: number) =>
    db.trackCategoryPerformance(category, correct, total).catch(console.error),
  getCategoryStats: () => db.getCategoryStats().catch(() => ({})),
};

