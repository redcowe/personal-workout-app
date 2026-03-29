import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ClipboardList, Play } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { useExerciseStore } from '../store/exerciseStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/dates';

export function Templates() {
  const { templates, deleteTemplate } = useTemplateStore();
  const { exercises } = useExerciseStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getExerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Unknown';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Workout Templates</h1>
        <Link to="/templates/new">
          <Button><Plus size={16} /> New Template</Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No templates yet"
          description="Create a workout template to quickly start sessions with your favorite exercises."
          action={<Link to="/templates/new"><Button><Plus size={16} /> New Template</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold text-lg">{template.name}</p>
                  {template.description && (
                    <p className="text-slate-400 text-sm mt-0.5">{template.description}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1">Created {formatDate(template.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <Link to={`/templates/${template.id}/edit`}>
                    <button className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"><Pencil size={15} /></button>
                  </Link>
                  <button onClick={() => setConfirmDelete(template.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <ul className="flex flex-col gap-1">
                {template.exercises.slice(0, 4).map((te, i) => (
                  <li key={i} className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="text-slate-600">•</span>
                    {getExerciseName(te.exerciseId)}
                    <span className="text-slate-600 text-xs">{te.sets}×{te.reps}{te.weight ? ` @ ${te.weight}kg` : ''}</span>
                  </li>
                ))}
                {template.exercises.length > 4 && (
                  <li className="text-slate-600 text-xs">+{template.exercises.length - 4} more</li>
                )}
              </ul>

              <Link to={`/log?template=${template.id}`} className="mt-auto">
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  <Play size={14} /> Start Workout
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Template" size="sm">
        <p className="text-slate-300 mb-6">Are you sure you want to delete this template?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { deleteTemplate(confirmDelete!); setConfirmDelete(null); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
