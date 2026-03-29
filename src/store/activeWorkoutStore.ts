import { create } from 'zustand';
import type { LogExercise } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'workout-app:active-workout';

export interface ActiveWorkout {
  templateId?: string;
  templateName?: string;
  startedAt: string;       // ISO timestamp when workout began
  elapsedSeconds: number;  // accumulated seconds (updated when navigating away)
  exercises: LogExercise[];
  notes: string;
}

interface ActiveWorkoutStore {
  active: ActiveWorkout | null;
  start: (workout: Omit<ActiveWorkout, 'startedAt' | 'elapsedSeconds'>) => void;
  update: (patch: Partial<Pick<ActiveWorkout, 'exercises' | 'notes' | 'elapsedSeconds'>>) => void;
  clear: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>((set) => ({
  active: loadFromStorage<ActiveWorkout | null>(STORAGE_KEY, null),

  start: (workout) => {
    const active: ActiveWorkout = {
      ...workout,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
    };
    saveToStorage(STORAGE_KEY, active);
    set({ active });
  },

  update: (patch) =>
    set((state) => {
      if (!state.active) return state;
      const active = { ...state.active, ...patch };
      saveToStorage(STORAGE_KEY, active);
      return { active };
    }),

  clear: () => {
    saveToStorage(STORAGE_KEY, null);
    set({ active: null });
  },
}));
