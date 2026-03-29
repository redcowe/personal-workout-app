import { Link } from 'react-router-dom';
import { Dumbbell, Plus, History, Calendar, Play, ChevronRight } from 'lucide-react';
import { useWorkoutLogStore } from '../store/workoutLogStore';
import { useTemplateStore } from '../store/templateStore';
import { useExerciseStore } from '../store/exerciseStore';
import { Card } from '../components/ui/Card';
import { formatDate } from '../utils/dates';
import { getLast7Days, isSameDay } from '../utils/dates';

export function Dashboard() {
  const { logs } = useWorkoutLogStore();
  const { templates } = useTemplateStore();
  const { exercises } = useExerciseStore();

  const recentLogs = [...logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const last7 = getLast7Days();
  const totalSets = logs.reduce(
    (sum, log) => sum + log.exercises.reduce((s, ex) => s + ex.sets.filter((set) => set.status === 'completed').length, 0),
    0
  );

  const getExerciseNames = (template: typeof templates[0]) =>
    template.exercises
      .slice(0, 3)
      .map((te) => exercises.find((e) => e.id === te.exerciseId)?.name ?? '')
      .filter(Boolean)
      .join(', ') + (template.exercises.length > 3 ? ` +${template.exercises.length - 3} more` : '');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Keep up the great work.</p>
      </div>

      {/* Start a Workout */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Dumbbell size={18} className="text-violet-400" /> Start a Workout
          </h2>
          <Link to="/templates/new" className="text-violet-400 text-sm hover:text-violet-300 flex items-center gap-1">
            <Plus size={14} /> New template
          </Link>
        </div>

        {templates.length === 0 ? (
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">No templates yet</p>
              <p className="text-slate-400 text-sm">Create a template or start a blank session</p>
            </div>
            <div className="flex gap-2">
              <Link to="/templates/new" className="text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">
                New template
              </Link>
              <Link to="/log" className="text-sm px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center gap-1">
                <Play size={13} /> Blank
              </Link>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {templates.map((template) => (
              <Card key={template.id} className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{template.name}</p>
                  <p className="text-slate-500 text-xs truncate">{getExerciseNames(template)}</p>
                </div>
                <Link
                  to={`/log?template=${template.id}`}
                  className="ml-4 shrink-0 flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Play size={13} /> Start
                </Link>
              </Card>
            ))}
            <Link
              to="/log"
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="text-sm">Blank workout (no template)</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold text-violet-400">{logs.length}</p>
          <p className="text-slate-400 text-sm mt-1">Workouts</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-violet-400">{templates.length}</p>
          <p className="text-slate-400 text-sm mt-1">Templates</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-violet-400">{totalSets}</p>
          <p className="text-slate-400 text-sm mt-1">Total Sets</p>
        </Card>
      </div>

      {/* Week at a glance */}
      <Card className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-violet-400" />
          <h2 className="text-white font-semibold">This Week</h2>
        </div>
        <div className="flex gap-2">
          {last7.map((day) => {
            const hasWorkout = logs.some((log) => isSameDay(log.date, day + 'T00:00:00'));
            const label = new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = day === new Date().toISOString().split('T')[0];
            return (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-slate-500">{label[0]}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    hasWorkout
                      ? 'bg-violet-600 text-white'
                      : isToday
                      ? 'border-2 border-violet-500 text-violet-400'
                      : 'bg-slate-700 text-slate-500'
                  }`}
                >
                  {new Date(day + 'T12:00:00').getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent workouts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-violet-400" />
            <h2 className="text-white font-semibold">Recent Workouts</h2>
          </div>
          <Link to="/history" className="text-violet-400 text-sm hover:text-violet-300">
            View all
          </Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No workouts logged yet. Start your first session!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentLogs.map((log) => {
              const completedSets = log.exercises.reduce((s, ex) => s + ex.sets.filter((set) => set.status === 'completed').length, 0);
              return (
                <li key={log.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{log.templateName || 'Custom Workout'}</p>
                    <p className="text-slate-400 text-xs">{formatDate(log.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-300 text-sm">{log.exercises.length} exercises</p>
                    <p className="text-slate-500 text-xs">{completedSets} sets</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
