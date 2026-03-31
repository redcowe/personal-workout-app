import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, XCircle, Plus, Trash2, Clock, Save, X, Pause, Play } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useWorkoutLogStore } from '../store/workoutLogStore';
import { useActiveWorkoutStore } from '../store/activeWorkoutStore';
import type { LogExercise, SetStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { applyProgression } from '../utils/progression';

function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [paused, setPaused] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) {
      if (ref.current) clearInterval(ref.current);
      return;
    }
    ref.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [paused]);

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return { seconds, setSeconds, fmt, paused, toggle: () => setPaused((p) => !p) };
}

export function LogWorkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const { templates, updateTemplate } = useTemplateStore();
  const { exercises } = useExerciseStore();
  const { addLog } = useWorkoutLogStore();
  const { active, start, update, clear } = useActiveWorkoutStore();

  // Determine the template for this session (from URL param)
  const urlTemplate = templateId ? templates.find((t) => t.id === templateId) : null;

  // On first render, decide: restore active workout or start fresh
  const isRestoring = !templateId && !!active;
  const restoredOrNew = isRestoring ? active! : null;

  const [logExercises, setLogExercises] = useState<LogExercise[]>(() => {
    if (restoredOrNew) return restoredOrNew.exercises;
    if (urlTemplate) {
      return urlTemplate.exercises.map((te) => ({
        exerciseId: te.exerciseId,
        sets: Array.from({ length: te.sets }, () => ({
          reps: te.reps,
          weight: te.weight,
          status: 'pending' as SetStatus,
        })),
      }));
    }
    return [];
  });

  const [notes, setNotes] = useState(restoredOrNew?.notes ?? '');
  const [finishOpen, setFinishOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const effectiveTemplate = isRestoring
    ? { id: active?.templateId, name: active?.templateName }
    : urlTemplate ?? null;

  const timer = useTimer(restoredOrNew?.elapsedSeconds ?? 0);

  // Start or resume the active workout in the store
  useEffect(() => {
    if (isRestoring) return; // already in store
    start({
      templateId: urlTemplate?.id,
      templateName: urlTemplate?.name,
      exercises: logExercises,
      notes: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync exercises + notes + elapsed to store whenever they change
  useEffect(() => {
    update({ exercises: logExercises, notes, elapsedSeconds: timer.seconds });
  }, [logExercises, notes, timer.seconds]);

  const getExerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Unknown';

  const cycleSetStatus = (exIdx: number, setIdx: number) => {
    setLogExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => {
                if (j !== setIdx) return s;
                const next: SetStatus =
                  s.status === 'pending' ? 'completed' :
                  s.status === 'completed' ? 'failed' : 'pending';
                return { ...s, status: next };
              }),
            }
          : ex
      )
    );
  };

  const updateSetField = (exIdx: number, setIdx: number, field: 'reps' | 'weight', val: number | undefined) => {
    setLogExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: val } : s)) }
          : ex
      )
    );
  };

  const addSet = (exIdx: number) => {
    setLogExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { reps: last?.reps ?? 10, weight: last?.weight, status: 'pending' as SetStatus }] };
      })
    );
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setLogExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex
      )
    );
  };

  const addExercise = (exerciseId: string) => {
    setLogExercises((prev) => [...prev, { exerciseId, sets: [{ reps: 10, weight: undefined, status: 'pending' as SetStatus }] }]);
    setPickerOpen(false);
    setPickerSearch('');
  };

  const removeExercise = (exIdx: number) => {
    setLogExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const handleFinish = async () => {
    const log = await addLog({
      templateId: effectiveTemplate?.id,
      templateName: effectiveTemplate?.name,
      date: new Date().toISOString(),
      durationMinutes: Math.round(timer.seconds / 60),
      exercises: logExercises,
      notes,
    });

    // Silently apply progressive overload to the template if applicable
    const usedTemplate = effectiveTemplate?.id
      ? templates.find((t) => t.id === effectiveTemplate.id)
      : null;
    if (usedTemplate && log) {
      const progressed = applyProgression(usedTemplate, log);
      if (progressed) {
        await updateTemplate(usedTemplate.id, { exercises: progressed });
      }
    }

    clear();
    navigate('/history');
  };

  const handleDiscard = () => {
    clear();
    navigate('/');
  };

  const completedSets = logExercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.status === 'completed').length, 0);
  const totalSets = logExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const filteredExercises = exercises.filter((ex) => ex.name.toLowerCase().includes(pickerSearch.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-36 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-white truncate pr-2">{effectiveTemplate?.name ?? 'Custom Workout'}</h1>
        {/* Timer — always visible in header */}
        <button
          onClick={timer.toggle}
          title={timer.paused ? 'Resume timer' : 'Pause timer'}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors font-mono shrink-0 ${
            timer.paused
              ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 animate-pulse'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock size={15} />
          <span>{timer.fmt}</span>
          {timer.paused ? <Play size={13} /> : <Pause size={13} />}
        </button>
      </div>
      <p className="text-slate-400 text-sm mb-6">{completedSets}/{totalSets} sets completed</p>

      {/* Exercises */}
      <div className="flex flex-col gap-4">
        {logExercises.map((logEx, exIdx) => (
          <Card key={exIdx}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">{getExerciseName(logEx.exerciseId)}</h2>
              <button onClick={() => removeExercise(exIdx)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                <Trash2 size={15} />
              </button>
            </div>

            {/* Set headers */}
            <div className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 mb-2 px-1">
              <span className="text-xs text-slate-600">Set</span>
              <span className="text-xs text-slate-600">Reps</span>
              <span className="text-xs text-slate-600">Weight (kg)</span>
              <span />
            </div>

            {logEx.sets.map((set, setIdx) => (
              <div
                key={setIdx}
                className={`grid grid-cols-[32px_1fr_1fr_32px] gap-2 items-center mb-1.5 rounded-lg px-1 py-0.5 transition-colors ${
                  set.status === 'completed' ? 'bg-green-900/20' :
                  set.status === 'failed' ? 'bg-red-900/20' : ''
                }`}
              >
                <button
                  onClick={() => cycleSetStatus(exIdx, setIdx)}
                  title={set.status === 'pending' ? 'Mark complete' : set.status === 'completed' ? 'Mark failed' : 'Clear'}
                  className={`transition-colors ${
                    set.status === 'completed' ? 'text-green-400' :
                    set.status === 'failed' ? 'text-red-400' :
                    'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {set.status === 'completed' ? <CheckCircle2 size={20} /> :
                   set.status === 'failed' ? <XCircle size={20} /> :
                   <Circle size={20} />}
                </button>
                <input
                  type="number"
                  value={set.reps}
                  min={1}
                  onChange={(e) => updateSetField(exIdx, setIdx, 'reps', Number(e.target.value))}
                  className="bg-slate-900 border border-slate-600 rounded px-2 py-2.5 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <input
                  type="number"
                  value={set.weight ?? ''}
                  min={0}
                  step={0.5}
                  placeholder="—"
                  onChange={(e) => updateSetField(exIdx, setIdx, 'weight', e.target.value === '' ? undefined : Number(e.target.value))}
                  className="bg-slate-900 border border-slate-600 rounded px-2 py-2.5 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button onClick={() => removeSet(exIdx, setIdx)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={() => addSet(exIdx)}
              className="mt-2 text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add Set
            </button>
          </Card>
        ))}

        <button
          onClick={() => setPickerOpen(true)}
          className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Exercise
        </button>
      </div>

      {/* Exercise picker modal */}
      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} title="Add Exercise">
        <div className="relative mb-3">
          <input
            autoFocus
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-3 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <ul className="max-h-72 overflow-y-auto flex flex-col gap-1">
          {filteredExercises.map((ex) => (
            <li key={ex.id}>
              <button
                onClick={() => addExercise(ex.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center justify-between"
              >
                <span>{ex.name}</span>
                <span className="text-slate-500 text-xs">{ex.muscleGroup}</span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      {/* Finish confirmation */}
      <Modal isOpen={finishOpen} onClose={() => setFinishOpen(false)} title="Finish Workout" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-slate-300 text-sm">
            {completedSets}/{totalSets} sets completed · {timer.fmt} elapsed
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How did it go?"
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setFinishOpen(false)}>Keep Going</Button>
            <Button onClick={handleFinish}>Save Workout</Button>
          </div>
        </div>
      </Modal>

      {/* Discard confirmation */}
      <Modal isOpen={discardOpen} onClose={() => setDiscardOpen(false)} title="Discard Workout" size="sm">
        <p className="text-slate-300 mb-6">Are you sure? This workout won't be saved.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDiscardOpen(false)}>Keep Going</Button>
          <Button variant="danger" onClick={handleDiscard}>Discard</Button>
        </div>
      </Modal>

      {/* Sticky action bar — sits above mobile bottom nav, hidden on desktop */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 flex gap-3 px-4 py-3 bg-slate-900/95 backdrop-blur border-t border-slate-700 z-40">
        <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDiscardOpen(true)}>
          <X size={16} /> Discard
        </Button>
        <Button className="flex-1" onClick={() => setFinishOpen(true)}>
          <Save size={16} /> Finish Workout
        </Button>
      </div>

      {/* Desktop action buttons — hidden on mobile */}
      <div className="hidden md:flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={() => setDiscardOpen(true)}>
          <X size={16} /> Discard
        </Button>
        <Button onClick={() => setFinishOpen(true)}>
          <Save size={16} /> Finish Workout
        </Button>
      </div>
    </div>
  );
}
