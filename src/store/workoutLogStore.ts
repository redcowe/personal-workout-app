import { create } from 'zustand';
import type { WorkoutLog } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'workout-app:logs';

interface WorkoutLogStore {
  logs: WorkoutLog[];
  addLog: (log: Omit<WorkoutLog, 'id'>) => void;
  deleteLog: (id: string) => void;
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useWorkoutLogStore = create<WorkoutLogStore>((set) => ({
  logs: loadFromStorage<WorkoutLog[]>(STORAGE_KEY, []),

  addLog: (log) =>
    set((state) => {
      const newLog: WorkoutLog = { ...log, id: genId() };
      const updated = [...state.logs, newLog];
      saveToStorage(STORAGE_KEY, updated);
      return { logs: updated };
    }),

  deleteLog: (id) =>
    set((state) => {
      const updated = state.logs.filter((l) => l.id !== id);
      saveToStorage(STORAGE_KEY, updated);
      return { logs: updated };
    }),
}));
