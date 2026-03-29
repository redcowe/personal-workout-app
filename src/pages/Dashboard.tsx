import { Link } from 'react-router-dom';
import { Plus, Play, ChevronRight, Zap, Flame } from 'lucide-react';
import { useMemo } from 'react';
import { useWorkoutLogStore } from '../store/workoutLogStore';
import { useTemplateStore } from '../store/templateStore';
import { useExerciseStore } from '../store/exerciseStore';
import { useActiveWorkoutStore } from '../store/activeWorkoutStore';
import { Card } from '../components/ui/Card';
import { WorkoutHeatmap } from '../components/progress/WorkoutHeatmap';
import { formatDate } from '../utils/dates';

export function Dashboard() {
  const { logs } = useWorkoutLogStore();
  const { templates } = useTemplateStore();
  const { exercises } = useExerciseStore();
  const { active } = useActiveWorkoutStore();

  const recentLogs = [...logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

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

  // Weekly stats
  const { streak, thisWeekWorkouts, thisWeekSets } = useMemo(() => {
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Streak: count consecutive days with at least one workout going back from today
    const workoutDays = new Set(sorted.map((l) => l.date.split('T')[0]));
    let streakCount = 0;
    const cursor = new Date(today);
    while (true) {
      const key = cursor.toISOString().split('T')[0];
      if (workoutDays.has(key)) {
        streakCount++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }

    // This week (Mon–Sun)
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const weekLogs = logs.filter((l) => {
      const d = new Date(l.date);
      return d >= monday && d <= today;
    });
    const weekSets = weekLogs.reduce(
      (s, l) => s + l.exercises.reduce((ss, ex) => ss + ex.sets.filter((set) => set.status === 'completed').length, 0),
      0
    );

    return { streak: streakCount, thisWeekWorkouts: weekLogs.length, thisWeekSets: weekSets };
  }, [logs]);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Resume active workout banner */}
      {active && (
        <Link to="/log" className="block mb-6">
          <div className="flex items-center justify-between bg-violet-600/20 border border-violet-500 rounded-xl px-5 py-4 hover:bg-violet-600/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-500 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Workout in progress</p>
                <p className="text-violet-300 text-xs">{active.templateName ?? 'Custom Workout'} · {String(Math.floor(active.elapsedSeconds / 60)).padStart(2, '0')}:{String(active.elapsedSeconds % 60).padStart(2, '0')} elapsed</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-violet-300 text-sm font-medium">
              <Play size={14} /> Resume
            </div>
          </div>
        </Link>
      )}

      {/* Start a Workout */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Start a Workout</h2>
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
      <div className="flex items-center gap-8 mb-8">
        <div>
          <p className="text-2xl font-bold text-violet-400">{logs.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Workouts</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div>
          <p className="text-2xl font-bold text-violet-400">{templates.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Templates</p>
        </div>
        <div className="w-px h-8 bg-slate-700" />
        <div>
          <p className="text-2xl font-bold text-violet-400">{totalSets}</p>
          <p className="text-slate-500 text-xs mt-0.5">Total Sets</p>
        </div>
      </div>

      {/* Heatmap — desktop only */}
      <Card className="mb-8 hidden md:block">
        <h2 className="text-white font-semibold mb-4">Activity</h2>
        <WorkoutHeatmap logs={logs} weeks={26} />
      </Card>

      {/* Mobile activity summary */}
      <div className="md:hidden mb-8">
        <h2 className="text-white font-semibold mb-3">This Week</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="flex flex-col items-center py-4 px-2">
            <div className="flex items-center gap-1 mb-1">
              <Flame size={16} className={streak > 0 ? 'text-orange-400' : 'text-slate-600'} />
              <span className="text-2xl font-bold text-white">{streak}</span>
            </div>
            <span className="text-slate-500 text-xs text-center">Day streak</span>
          </Card>
          <Card className="flex flex-col items-center py-4 px-2">
            <span className="text-2xl font-bold text-violet-400 mb-1">{thisWeekWorkouts}</span>
            <span className="text-slate-500 text-xs text-center">Workouts</span>
          </Card>
          <Card className="flex flex-col items-center py-4 px-2">
            <span className="text-2xl font-bold text-violet-400 mb-1">{thisWeekSets}</span>
            <span className="text-slate-500 text-xs text-center">Sets done</span>
          </Card>
        </div>
      </div>

      {/* Recent workouts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Workouts</h2>
          <Link to="/history" className="text-violet-400 text-sm hover:text-violet-300">View all</Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No workouts logged yet. Start your first session!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentLogs.map((log) => {
              const completedSets = log.exercises.reduce((s, ex) => s + ex.sets.filter((set) => set.status === 'completed').length, 0);
              return (
                <li key={log.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-700 last:border-0">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{log.templateName || 'Custom Workout'}</p>
                    <p className="text-slate-400 text-xs">{formatDate(log.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
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
