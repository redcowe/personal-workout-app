import type { Exercise } from '../types';

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const SEED_EXERCISES: Exercise[] = [
  // Chest
  { id: genId(), name: 'Bench Press', muscleGroup: 'Chest', type: 'strength' },
  { id: genId(), name: 'Incline Bench Press', muscleGroup: 'Chest', type: 'strength' },
  { id: genId(), name: 'Dumbbell Flyes', muscleGroup: 'Chest', type: 'strength' },
  { id: genId(), name: 'Push-ups', muscleGroup: 'Chest', type: 'bodyweight' },
  { id: genId(), name: 'Cable Crossover', muscleGroup: 'Chest', type: 'strength' },

  // Back
  { id: genId(), name: 'Deadlift', muscleGroup: 'Back', type: 'strength' },
  { id: genId(), name: 'Pull-ups', muscleGroup: 'Back', type: 'bodyweight' },
  { id: genId(), name: 'Barbell Row', muscleGroup: 'Back', type: 'strength' },
  { id: genId(), name: 'Lat Pulldown', muscleGroup: 'Back', type: 'strength' },
  { id: genId(), name: 'Seated Cable Row', muscleGroup: 'Back', type: 'strength' },

  // Shoulders
  { id: genId(), name: 'Overhead Press', muscleGroup: 'Shoulders', type: 'strength' },
  { id: genId(), name: 'Lateral Raises', muscleGroup: 'Shoulders', type: 'strength' },
  { id: genId(), name: 'Front Raises', muscleGroup: 'Shoulders', type: 'strength' },
  { id: genId(), name: 'Face Pulls', muscleGroup: 'Shoulders', type: 'strength' },

  // Biceps
  { id: genId(), name: 'Barbell Curl', muscleGroup: 'Biceps', type: 'strength' },
  { id: genId(), name: 'Dumbbell Curl', muscleGroup: 'Biceps', type: 'strength' },
  { id: genId(), name: 'Hammer Curl', muscleGroup: 'Biceps', type: 'strength' },

  // Triceps
  { id: genId(), name: 'Tricep Pushdown', muscleGroup: 'Triceps', type: 'strength' },
  { id: genId(), name: 'Skull Crushers', muscleGroup: 'Triceps', type: 'strength' },
  { id: genId(), name: 'Dips', muscleGroup: 'Triceps', type: 'bodyweight' },

  // Legs
  { id: genId(), name: 'Squat', muscleGroup: 'Legs', type: 'strength' },
  { id: genId(), name: 'Leg Press', muscleGroup: 'Legs', type: 'strength' },
  { id: genId(), name: 'Leg Curl', muscleGroup: 'Legs', type: 'strength' },
  { id: genId(), name: 'Leg Extension', muscleGroup: 'Legs', type: 'strength' },
  { id: genId(), name: 'Lunges', muscleGroup: 'Legs', type: 'bodyweight' },

  // Glutes
  { id: genId(), name: 'Hip Thrust', muscleGroup: 'Glutes', type: 'strength' },
  { id: genId(), name: 'Romanian Deadlift', muscleGroup: 'Glutes', type: 'strength' },

  // Calves
  { id: genId(), name: 'Calf Raises', muscleGroup: 'Calves', type: 'strength' },

  // Core
  { id: genId(), name: 'Plank', muscleGroup: 'Core', type: 'bodyweight' },
  { id: genId(), name: 'Crunches', muscleGroup: 'Core', type: 'bodyweight' },
  { id: genId(), name: 'Russian Twists', muscleGroup: 'Core', type: 'bodyweight' },

  // Cardio
  { id: genId(), name: 'Running', muscleGroup: 'Cardio', type: 'cardio' },
  { id: genId(), name: 'Cycling', muscleGroup: 'Cardio', type: 'cardio' },
  { id: genId(), name: 'Jump Rope', muscleGroup: 'Cardio', type: 'cardio' },
];
