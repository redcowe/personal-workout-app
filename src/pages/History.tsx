import { useState } from 'react';
import { History as HistoryIcon, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkoutLogStore } from '../store/workoutLogStore';
import { useExerciseStore } from '../store/exerciseStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/dates';

export function History() {
  const { logs, deleteLog } = useWorkoutLogStore();
  const { exercises } = useExerciseStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const getExerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Unknown';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Workout History</h1>

      {sorted.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No workouts yet"
          description="Complete a workout session and it will appear here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((log) => {
            const isExpanded = expanded === log.id;
            const completedSets = log.exercises.reduce((s, ex) => s + ex.sets.filter((set) => set.completed).length, 0);
            const totalSets = log.exercises.reduce((s, ex) => s + ex.sets.length, 0);

            return (
              <Card key={log.id} className="cursor-pointer">
                <div
                  className="flex items-center justify-between"
                  onClick={() => setExpanded(isExpanded ? null : log.id)}
                >
                  <div>
                    <p className="text-white font-semibold">{log.templateName || 'Custom Workout'}</p>
                    <p className="text-slate-400 text-sm">{formatDate(log.date)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-slate-300 text-sm">{log.exercises.length} exercises</p>
                      <p className="text-slate-500 text-xs">{completedSets}/{totalSets} sets · {log.durationMinutes ?? '—'}m</p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 border-t border-slate-700 pt-4">
                    {log.exercises.map((logEx, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-white text-sm font-medium mb-1">{getExerciseName(logEx.exerciseId)}</p>
                        <div className="flex flex-wrap gap-2">
                          {logEx.sets.map((set, j) => (
                            <span
                              key={j}
                              className={`text-xs px-2 py-1 rounded ${set.completed ? 'bg-green-900/40 text-green-300' : 'bg-slate-700 text-slate-400'}`}
                            >
                              {set.reps} reps{set.weight ? ` @ ${set.weight}kg` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {log.notes && <p className="text-slate-400 text-sm mt-2 italic">"{log.notes}"</p>}
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => setConfirmDelete(log.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Workout" size="sm">
        <p className="text-slate-300 mb-6">Are you sure you want to delete this workout log?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { deleteLog(confirmDelete!); setConfirmDelete(null); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
