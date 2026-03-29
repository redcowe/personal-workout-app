import { create } from 'zustand';
import type { Exercise } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { SEED_EXERCISES } from '../data/seedExercises';

const STORAGE_KEY = 'workout-app:exercises';

interface ExerciseStore {
  exercises: Exercise[];
  addExercise: (ex: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, updates: Partial<Omit<Exercise, 'id'>>) => void;
  deleteExercise: (id: string) => void;
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const stored = loadFromStorage<Exercise[]>(STORAGE_KEY, []);
const initialExercises = stored.length > 0 ? stored : SEED_EXERCISES;
if (stored.length === 0) {
  saveToStorage(STORAGE_KEY, initialExercises);
}

export const useExerciseStore = create<ExerciseStore>((set) => ({
  exercises: initialExercises,

  addExercise: (ex) =>
    set((state) => {
      const newEx: Exercise = { ...ex, id: genId() };
      const updated = [...state.exercises, newEx];
      saveToStorage(STORAGE_KEY, updated);
      return { exercises: updated };
    }),

  updateExercise: (id, updates) =>
    set((state) => {
      const updated = state.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveToStorage(STORAGE_KEY, updated);
      return { exercises: updated };
    }),

  deleteExercise: (id) =>
    set((state) => {
      const updated = state.exercises.filter((e) => e.id !== id);
      saveToStorage(STORAGE_KEY, updated);
      return { exercises: updated };
    }),
}));
