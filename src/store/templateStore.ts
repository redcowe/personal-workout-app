import { create } from 'zustand';
import type { WorkoutTemplate } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'workout-app:templates';

interface TemplateStore {
  templates: WorkoutTemplate[];
  addTemplate: (t: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => WorkoutTemplate;
  updateTemplate: (id: string, updates: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>) => void;
  deleteTemplate: (id: string) => void;
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: loadFromStorage<WorkoutTemplate[]>(STORAGE_KEY, []),

  addTemplate: (t) => {
    const newTemplate: WorkoutTemplate = {
      ...t,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [...state.templates, newTemplate];
      saveToStorage(STORAGE_KEY, updated);
      return { templates: updated };
    });
    return newTemplate;
  },

  updateTemplate: (id, updates) =>
    set((state) => {
      const updated = state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveToStorage(STORAGE_KEY, updated);
      return { templates: updated };
    }),

  deleteTemplate: (id) =>
    set((state) => {
      const updated = state.templates.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEY, updated);
      return { templates: updated };
    }),
}));
