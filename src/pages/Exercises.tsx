import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useExerciseStore } from '../store/exerciseStore';
import { useForm } from 'react-hook-form';
import type { Exercise, MuscleGroup, ExerciseType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Core', 'Legs', 'Glutes', 'Calves', 'Cardio', 'Full Body',
];

const typeColorMap: Record<ExerciseType, 'violet' | 'green' | 'blue'> = {
  strength: 'violet',
  cardio: 'green',
  bodyweight: 'blue',
};

interface FormData {
  name: string;
  muscleGroup: MuscleGroup;
  type: ExerciseType;
  notes?: string;
}

export function Exercises() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useExerciseStore();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const filtered = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === 'All' || ex.muscleGroup === filterGroup;
    return matchSearch && matchGroup;
  });

  const openAdd = () => {
    setEditingEx(null);
    reset({ name: '', muscleGroup: 'Chest', type: 'strength', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditingEx(ex);
    reset({ name: ex.name, muscleGroup: ex.muscleGroup, type: ex.type, notes: ex.notes || '' });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editingEx) {
      updateExercise(editingEx.id, data);
    } else {
      addExercise(data);
    }
    setModalOpen(false);
    reset();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Exercise Library</h1>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add Exercise
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="All">All Groups</option>
          {MUSCLE_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No exercises found"
          description={search ? 'Try a different search term.' : 'Add your first exercise to get started.'}
          action={<Button onClick={openAdd}><Plus size={16} /> Add Exercise</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((ex) => (
            <Card key={ex.id} className="flex items-start justify-between">
              <div>
                <p className="text-white font-medium mb-1">{ex.name}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color="slate">{ex.muscleGroup}</Badge>
                  <Badge color={typeColorMap[ex.type]}>{ex.type}</Badge>
                </div>
                {ex.notes && <p className="text-slate-500 text-xs mt-1">{ex.notes}</p>}
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button onClick={() => openEdit(ex)} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setConfirmDelete(ex.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingEx ? 'Edit Exercise' : 'Add Exercise'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Exercise Name"
            placeholder="e.g. Bench Press"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Select label="Muscle Group" {...register('muscleGroup', { required: true })}>
            {MUSCLE_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </Select>
          <Select label="Type" {...register('type', { required: true })}>
            <option value="strength">Strength</option>
            <option value="bodyweight">Bodyweight</option>
            <option value="cardio">Cardio</option>
          </Select>
          <Input
            label="Notes (optional)"
            placeholder="Any notes..."
            {...register('notes')}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingEx ? 'Save Changes' : 'Add Exercise'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Exercise" size="sm">
        <p className="text-slate-300 mb-6">Are you sure you want to delete this exercise? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { deleteExercise(confirmDelete!); setConfirmDelete(null); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
