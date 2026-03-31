import type { WorkoutTemplate, TemplateExercise, WorkoutLog } from '../types';

/**
 * Double-progression logic.
 *
 * For each exercise in the template that has a `progression` config:
 *   - If all sets were completed AND every set's reps >= maxReps
 *       → weight += weightIncrement, reps reset to minReps
 *   - If all sets were completed AND every set's reps >= current template reps (but some < maxReps)
 *       → reps += 1 (aim for one more next time)
 *   - Otherwise (sets missed or reps below target) → no change
 *
 * Returns a new exercises array if anything changed, or null if nothing progressed.
 */
export function applyProgression(
  template: WorkoutTemplate,
  log: WorkoutLog
): TemplateExercise[] | null {
  let changed = false;

  const updated = template.exercises.map((te): TemplateExercise => {
    if (!te.progression) return te;

    const { minReps, maxReps, weightIncrement } = te.progression;

    const loggedEx = log.exercises.find((le) => le.exerciseId === te.exerciseId);
    if (!loggedEx) return te;

    const completedSets = loggedEx.sets.filter((s) => s.status === 'completed');

    // Must have completed all expected sets
    if (completedSets.length < te.sets) return te;

    const repsDone = completedSets.map((s) => s.reps);
    const minRepsDone = Math.min(...repsDone);

    if (minRepsDone >= maxReps) {
      // All sets hit maxReps → bump weight, reset reps
      changed = true;
      return {
        ...te,
        reps: minReps,
        weight: (te.weight ?? 0) + weightIncrement,
      };
    }

    if (minRepsDone >= te.reps) {
      // All sets hit current target but not yet maxReps → aim for one more rep
      changed = true;
      return { ...te, reps: te.reps + 1 };
    }

    // Fell short of current rep target → no change
    return te;
  });

  return changed ? updated : null;
}
