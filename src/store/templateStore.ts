import { create } from 'zustand';
import type { WorkoutTemplate } from '../types';
import * as fb from '../lib/firebase';

interface TemplateStore {
  templates: WorkoutTemplate[];
  loading: boolean;
  fetch: () => Promise<void>;
  addTemplate: (t: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => Promise<WorkoutTemplate>;
  updateTemplate: (id: string, updates: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const templates = await fb.getTemplates();
      set({ templates, loading: false });
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      set({ loading: false });
    }
  },

  addTemplate: async (t) => {
    const newTemplate = await fb.createTemplate({ ...t, createdAt: new Date().toISOString() });
    set((state) => ({ templates: [...state.templates, newTemplate] }));
    return newTemplate;
  },

  updateTemplate: async (id, updates) => {
    await fb.updateTemplate(id, updates);
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTemplate: async (id) => {
    await fb.deleteTemplate(id);
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
  },
}));

