import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useExerciseStore } from '../../store/exerciseStore';
import { useTemplateStore } from '../../store/templateStore';
import { useWorkoutLogStore } from '../../store/workoutLogStore';

export function AppLoader({ children }: { children: ReactNode }) {
  const fetchExercises = useExerciseStore((s) => s.fetch);
  const fetchTemplates = useTemplateStore((s) => s.fetch);
  const fetchLogs = useWorkoutLogStore((s) => s.fetch);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchExercises(), fetchTemplates(), fetchLogs()])
      .then(() => setReady(true))
      .catch((err) => setError(err.message ?? 'Failed to connect to API'));
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-white text-xl font-bold mb-2">Could not reach Firebase</h1>
        <p className="text-slate-400 text-sm max-w-sm mb-4">{error}</p>
        <p className="text-slate-500 text-xs">Check your <code className="text-slate-300">VITE_FIREBASE_*</code> environment variables in <code className="text-slate-300">.env</code>.</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Connecting to database…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
