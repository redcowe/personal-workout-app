export type ExerciseType = 'strength' | 'cardio' | 'bodyweight';

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Core'
  | 'Legs'
  | 'Glutes'
  | 'Calves'
  | 'Cardio'
  | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  type: ExerciseType;
  notes?: string;
}

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  restSeconds?: number;
  progression?: ProgressionConfig;
}

export interface ProgressionConfig {
  minReps: number;
  maxReps: number;
  weightIncrement: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  createdAt: string;
}

export type SetStatus = 'pending' | 'completed' | 'failed';

export interface LogSet {
  reps: number;
  weight?: number;
  status: SetStatus;
}

export interface LogExercise {
  exerciseId: string;
  sets: LogSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  templateId?: string;
  templateName?: string;
  date: string;
  durationMinutes?: number;
  exercises: LogExercise[];
  notes?: string;
}
