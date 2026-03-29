import { create } from 'zustand';
import type { WorkoutLog } from '../types';
import * as fb from '../lib/firebase';

interface WorkoutLogStore {
  logs: WorkoutLog[];
  loading: boolean;
  fetch: () => Promise<void>;
  addLog: (log: Omit<WorkoutLog, 'id'>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export const useWorkoutLogStore = create<WorkoutLogStore>((set) => ({
  logs: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const logs = await fb.getLogs();
      set({ logs, loading: false });
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      set({ loading: false });
    }
  },

  addLog: async (log) => {
    const newLog = await fb.createLog(log);
    set((state) => ({ logs: [newLog, ...state.logs] }));
  },

  deleteLog: async (id) => {
    await fb.deleteLog(id);
    set((state) => ({ logs: state.logs.filter((l) => l.id !== id) }));
  },
}));

