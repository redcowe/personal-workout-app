import { useMemo } from 'react';
import type { WorkoutLog } from '../../types';

interface Props {
  logs: WorkoutLog[];
  weeks?: number;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function intensityClass(sets: number): string {
  if (sets === 0) return 'bg-slate-800';
  if (sets <= 8) return 'bg-violet-900';
  if (sets <= 16) return 'bg-violet-700';
  if (sets <= 24) return 'bg-violet-500';
  return 'bg-violet-400';
}

function buildCalendar(numWeeks: number): Date[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Snap back to the Sunday of the current week
  const startSunday = new Date(today);
  startSunday.setDate(today.getDate() - today.getDay() - (numWeeks - 1) * 7);

  return Array.from({ length: numWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = new Date(startSunday);
      day.setDate(startSunday.getDate() + w * 7 + d);
      return day;
    })
  );
}

export function WorkoutHeatmap({ logs, weeks = 26 }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const setsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const log of logs) {
      const day = log.date.split('T')[0];
      const sets = log.exercises.reduce(
        (s, ex) => s + ex.sets.filter((set) => set.status === 'completed').length,
        0
      );
      map[day] = (map[day] || 0) + sets;
    }
    return map;
  }, [logs]);

  const calendar = useMemo(() => buildCalendar(weeks), [weeks]);

  // Month label: show the abbreviated month name on the first week of each new month
  const monthLabels = useMemo(() => {
    const labels: (string | null)[] = calendar.map((week, wi) => {
      const firstDay = week[0];
      const prevWeek = calendar[wi - 1];
      if (!prevWeek || prevWeek[0].getMonth() !== firstDay.getMonth()) {
        return firstDay.toLocaleDateString('en-US', { month: 'short' });
      }
      return null;
    });
    return labels;
  }, [calendar]);

  const totalWorkouts = logs.length;
  const totalSets = Object.values(setsByDay).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1" style={{ minWidth: 'max-content' }}>
          {/* Month row */}
          <div className="flex gap-1 pl-5">
            {calendar.map((_, wi) => (
              <div key={wi} className="w-3 text-[10px] leading-none text-slate-500" style={{ width: 12 }}>
                {monthLabels[wi] ?? ''}
              </div>
            ))}
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-1">
            {/* Day-of-week labels (show M, W, F) */}
            <div className="flex flex-col gap-1 pr-1">
              {DAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  className="text-[10px] text-slate-600 flex items-center justify-end"
                  style={{ width: 12, height: 12, lineHeight: 1 }}
                >
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {calendar.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const sets = setsByDay[dateStr] ?? 0;
                  const isFuture = dateStr > today;
                  const isToday = dateStr === today;

                  return (
                    <div
                      key={di}
                      title={`${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${sets} sets`}
                      style={{ width: 12, height: 12 }}
                      className={`rounded-sm transition-colors ${
                        isFuture
                          ? 'bg-slate-900'
                          : isToday
                          ? `${intensityClass(sets)} ring-1 ring-offset-1 ring-offset-slate-800 ring-violet-400`
                          : intensityClass(sets)
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 pl-5 mt-1">
            <span className="text-[10px] text-slate-600">Less</span>
            {(['bg-slate-800', 'bg-violet-900', 'bg-violet-700', 'bg-violet-500', 'bg-violet-400'] as const).map(
              (cls, i) => (
                <div key={i} className={`rounded-sm ${cls}`} style={{ width: 12, height: 12 }} />
              )
            )}
            <span className="text-[10px] text-slate-600">More</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex gap-4 mt-3 text-xs text-slate-500">
        <span><span className="text-slate-300 font-medium">{totalWorkouts}</span> workouts in the last {weeks} weeks</span>
        <span><span className="text-slate-300 font-medium">{totalSets}</span> total sets</span>
      </div>
    </div>
  );
}
