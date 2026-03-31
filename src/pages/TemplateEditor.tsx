import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { useExerciseStore } from '../store/exerciseStore';
import type { TemplateExercise, ProgressionConfig } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';

export function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, addTemplate, updateTemplate } = useTemplateStore();
  const { exercises } = useExerciseStore();

  const isNew = !id;
  const existing = isNew ? null : templates.find((t) => t.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>(
    existing?.exercises ?? []
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (!isNew && !existing) navigate('/templates');
  }, [existing, isNew, navigate]);

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const addExToTemplate = (exerciseId: string) => {
    setTemplateExercises((prev) => [
      ...prev,
      { exerciseId, sets: 3, reps: 10, weight: undefined, restSeconds: 90 },
    ]);
    setPickerOpen(false);
    setPickerSearch('');
  };

  const updateEx = (index: number, field: keyof TemplateExercise, value: number | undefined) => {
    setTemplateExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const toggleProgression = (index: number) => {
    setTemplateExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== index) return ex;
        if (ex.progression) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { progression: _progression, ...rest } = ex;
          return rest;
        }
        return {
          ...ex,
          progression: { minReps: ex.reps, maxReps: ex.reps + 4, weightIncrement: 2.5 },
        };
      })
    );
  };

  const updateProgression = (index: number, field: keyof ProgressionConfig, value: number) => {
    setTemplateExercises((prev) =>
      prev.map((ex, i) =>
        i === index && ex.progression
          ? { ...ex, progression: { ...ex.progression, [field]: value } }
          : ex
      )
    );
  };

  const removeEx = (index: number) => {
    setTemplateExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: 'Template name is required' });
      return;
    }
    // Strip undefined values — Firestore rejects them
    const cleanExercises: typeof templateExercises = templateExercises.map((ex) => {
      const clean: typeof templateExercises[number] = {
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        ...(ex.weight != null && { weight: ex.weight }),
        ...(ex.restSeconds != null && { restSeconds: ex.restSeconds }),
        ...(ex.progression != null && { progression: ex.progression }),
      };
      return clean;
    });
    const data = { name: name.trim(), description: description.trim(), exercises: cleanExercises };
    setSaving(true);
    try {
      if (isNew) {
        await addTemplate(data);
      } else {
        await updateTemplate(id!, data);
      }
      navigate('/templates');
    } finally {
      setSaving(false);
    }
  };

  const getExerciseName = (exerciseId: string) =>
    exercises.find((e) => e.id === exerciseId)?.name ?? 'Unknown';

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{isNew ? 'New Template' : 'Edit Template'}</h1>
        <div className="flex gap-3 shrink-0">
          <Button variant="secondary" onClick={() => navigate('/templates')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Template'}</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-300">Template Name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors({}); }}
            placeholder="e.g. Push Day"
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-300">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Chest, triceps, and shoulders"
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white font-semibold">Exercises ({templateExercises.length})</h2>
        <Button size="sm" onClick={() => setPickerOpen(true)}>
          <Plus size={14} /> Add Exercise
        </Button>
      </div>

      {templateExercises.length === 0 ? (
        <Card className="text-center py-10 text-slate-500">
          No exercises yet. Add some to build your template.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {templateExercises.map((te, index) => (
            <Card key={index} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-slate-600" />
                  <p className="text-white font-medium">{getExerciseName(te.exerciseId)}</p>
                </div>
                <button onClick={() => removeEx(index)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Sets', field: 'sets' as const, min: 1 },
                  { label: 'Reps', field: 'reps' as const, min: 1 },
                  { label: 'Weight (kg)', field: 'weight' as const, min: 0 },
                  { label: 'Rest (sec)', field: 'restSeconds' as const, min: 0 },
                ].map(({ label, field, min }) => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">{label}</label>
                    <input
                      type="number"
                      min={min}
                      value={te[field] ?? ''}
                      onChange={(e) => updateEx(index, field, e.target.value === '' ? undefined : Number(e.target.value))}
                      className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Progressive overload toggle */}
              <button
                type="button"
                onClick={() => toggleProgression(index)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors w-fit ${
                  te.progression
                    ? 'text-violet-400 hover:text-violet-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {te.progression ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                Progressive overload
              </button>

              {te.progression && (
                <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-700">
                  {[
                    { label: 'Min reps', field: 'minReps' as const, min: 1 },
                    { label: 'Max reps', field: 'maxReps' as const, min: 1 },
                    { label: '+kg per step', field: 'weightIncrement' as const, min: 0.5 },
                  ].map(({ label, field, min }) => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500">{label}</label>
                      <input
                        type="number"
                        min={min}
                        step={field === 'weightIncrement' ? 0.5 : 1}
                        value={te.progression![field]}
                        onChange={(e) => updateProgression(index, field, Number(e.target.value))}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 w-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} title="Pick an Exercise" size="md">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            autoFocus
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <ul className="max-h-72 overflow-y-auto flex flex-col gap-1">
          {filteredExercises.map((ex) => (
            <li key={ex.id}>
              <button
                onClick={() => addExToTemplate(ex.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center justify-between"
              >
                <span>{ex.name}</span>
                <span className="text-slate-500 text-xs">{ex.muscleGroup}</span>
              </button>
            </li>
          ))}
          {filteredExercises.length === 0 && (
            <li className="text-center text-slate-500 text-sm py-8">No exercises found</li>
          )}
        </ul>
      </Modal>
    </div>
  );
}
