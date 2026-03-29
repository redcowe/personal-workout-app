import { create } from 'zustand';
import type { WorkoutTemplate } from '../types';
import { api } from '../utils/api';

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
      const templates = await api.getTemplates();
      set({ templates, loading: false });
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      set({ loading: false });
    }
  },

  addTemplate: async (t) => {
    const newTemplate = await api.createTemplate(t);
    set((state) => ({ templates: [...state.templates, newTemplate] }));
    return newTemplate;
  },

  updateTemplate: async (id, updates) => {
    const updated = await api.updateTemplate(id, updates);
    set((state) => ({ templates: state.templates.map((t) => (t.id === id ? { ...t, ...updated } : t)) }));
  },

  deleteTemplate: async (id) => {
    await api.deleteTemplate(id);
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
  },
}));

