import { create } from 'zustand';
import type { Exercise } from '../types';
import { api } from '../utils/api';
import { SEED_EXERCISES } from '../data/seedExercises';

interface ExerciseStore {
  exercises: Exercise[];
  loading: boolean;
  fetch: () => Promise<void>;
  addExercise: (ex: Omit<Exercise, 'id'>) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Omit<Exercise, 'id'>>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exercises: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      let exercises = await api.getExercises();
      // Seed the DB on first run if empty
      if (exercises.length === 0) {
        await Promise.all(SEED_EXERCISES.map((ex) => api.createExercise(ex)));
        exercises = await api.getExercises();
      }
      set({ exercises, loading: false });
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
      set({ loading: false });
    }
  },

  addExercise: async (ex) => {
    const newEx = await api.createExercise(ex);
    set((state) => ({ exercises: [...state.exercises, newEx] }));
  },

  updateExercise: async (id, updates) => {
    const existing = get().exercises.find((e) => e.id === id)!;
    const updated = await api.updateExercise(id, { ...existing, ...updates });
    set((state) => ({ exercises: state.exercises.map((e) => (e.id === id ? updated : e)) }));
  },

  deleteExercise: async (id) => {
    await api.deleteExercise(id);
    set((state) => ({ exercises: state.exercises.filter((e) => e.id !== id) }));
  },
}));

