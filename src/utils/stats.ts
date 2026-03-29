import type { WorkoutLog } from '../types';

export interface PersonalRecord {
  exerciseId: string;
  maxWeight: number;
  date: string;
}

export function getPersonalRecords(logs: WorkoutLog[]): Record<string, PersonalRecord> {
  const prs: Record<string, PersonalRecord> = {};
  for (const log of logs) {
    for (const ex of log.exercises) {
      for (const set of ex.sets) {
        if (set.status !== 'completed' || !set.weight) continue;
        const existing = prs[ex.exerciseId];
        if (!existing || set.weight > existing.maxWeight) {
          prs[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            maxWeight: set.weight,
            date: log.date,
          };
        }
      }
    }
  }
  return prs;
}

export function getWeeklyVolume(logs: WorkoutLog[]): { week: string; volume: number }[] {
  const weeks: Record<string, number> = {};
  for (const log of logs) {
    const d = new Date(log.date);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    const key = startOfWeek.toISOString().split('T')[0];
    let volume = 0;
    for (const ex of log.exercises) {
      for (const set of ex.sets) {
        if (set.status === 'completed' && set.weight) {
          volume += set.reps * set.weight;
        }
      }
    }
    weeks[key] = (weeks[key] || 0) + volume;
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, volume]) => ({ week, volume }));
}

export function getExerciseMaxWeightHistory(
  logs: WorkoutLog[],
  exerciseId: string
): { date: string; weight: number }[] {
  const result: { date: string; weight: number }[] = [];
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  for (const log of sorted) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    const maxWeight = Math.max(...ex.sets.filter((s) => s.status === 'completed' && s.weight).map((s) => s.weight!));
    if (maxWeight > 0) {
      result.push({ date: log.date.split('T')[0], weight: maxWeight });
    }
  }
  return result;
}
