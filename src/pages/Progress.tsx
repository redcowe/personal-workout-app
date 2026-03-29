import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useWorkoutLogStore } from '../store/workoutLogStore';
import { useExerciseStore } from '../store/exerciseStore';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { getPersonalRecords, getWeeklyVolume, getExerciseMaxWeightHistory } from '../utils/stats';
import { formatDateShort } from '../utils/dates';

export function Progress() {
  const { logs } = useWorkoutLogStore();
  const { exercises } = useExerciseStore();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  const prs = getPersonalRecords(logs);
  const weeklyVolume = getWeeklyVolume(logs);
  const weightHistory = selectedExerciseId
    ? getExerciseMaxWeightHistory(logs, selectedExerciseId)
    : [];

  const exercisesInLogs = exercises.filter((ex) =>
    logs.some((log) => log.exercises.some((le) => le.exerciseId === ex.id))
  );

  if (logs.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Progress</h1>
        <EmptyState
          icon={TrendingUp}
          title="No data yet"
          description="Complete some workouts to start tracking your progress."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Progress</h1>

      {/* Weekly Volume */}
      <Card className="mb-6">
        <h2 className="text-white font-semibold mb-4">Weekly Volume (kg × reps)</h2>
        {weeklyVolume.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No volume data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <Bar dataKey="volume" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Exercise Progress Chart */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Max Weight Over Time</h2>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select exercise</option>
            {exercisesInLogs.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
        {!selectedExerciseId ? (
          <p className="text-slate-500 text-sm text-center py-8">Select an exercise to see progress</p>
        ) : weightHistory.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No weight data for this exercise</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => formatDateShort(v + 'T12:00:00')} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#a78bfa' }}
                formatter={(v) => [`${v} kg`, 'Max Weight']}
              />
              <Line type="monotone" dataKey="weight" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Personal Records */}
      {Object.keys(prs).length > 0 && (
        <Card>
          <h2 className="text-white font-semibold mb-4">Personal Records 🏆</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(prs).map((pr) => {
              const ex = exercises.find((e) => e.id === pr.exerciseId);
              return (
                <div key={pr.exerciseId} className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{ex?.name ?? 'Unknown'}</p>
                    <p className="text-slate-500 text-xs">{formatDateShort(pr.date)}</p>
                  </div>
                  <p className="text-violet-400 font-bold text-lg">{pr.maxWeight} kg</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
