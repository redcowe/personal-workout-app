import { create } from 'zustand';
import type { Exercise } from '../types';
import * as fb from '../lib/firebase';
import { SEED_EXERCISES } from '../data/seedExercises';

interface ExerciseStore {
  exercises: Exercise[];
  loading: boolean;
  fetch: () => Promise<void>;
  addExercise: (ex: Omit<Exercise, 'id'>) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Omit<Exercise, 'id'>>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
}

export const useExerciseStore = create<ExerciseStore>((set) => ({
  exercises: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      let exercises = await fb.getExercises();
      if (exercises.length === 0) {
        await Promise.all(SEED_EXERCISES.map((ex) => fb.createExercise(ex)));
        exercises = await fb.getExercises();
      }
      set({ exercises, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  addExercise: async (ex) => {
    const newEx = await fb.createExercise(ex);
    set((state) => ({ exercises: [...state.exercises, newEx] }));
  },

  updateExercise: async (id, updates) => {
    await fb.updateExercise(id, updates);
    set((state) => ({
      exercises: state.exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  deleteExercise: async (id) => {
    await fb.deleteExercise(id);
    set((state) => ({ exercises: state.exercises.filter((e) => e.id !== id) }));
  },
}));

