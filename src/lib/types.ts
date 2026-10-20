export type Unit = 'kg' | 'lb'
export type Theme = 'dark' | 'light'
export type SetType = 'normal' | 'warmup' | 'drop' | 'failure'

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Band'
  | 'Other'

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Core'
  | 'Traps'
  | 'Cardio'
  | 'Full Body'

export interface Exercise {
  id: string
  name: string
  equipment: Equipment
  primary: MuscleGroup
  secondary: MuscleGroup[]
  category: 'strength' | 'cardio'
  custom?: boolean
  /** step-by-step instructions (English), from the dataset */
  instructions?: string[]
  /** media file stem — resolves to CDN image (jpg) and animation (gif) URLs */
  media?: string
}

/** One logged set. Weights are always stored in kilograms. */
export interface LoggedSet {
  type: SetType
  weight: number
  reps: number
  /** cardio: minutes */
  duration: number
  /** cardio: kilometres */
  distance: number
  done: boolean
}

export interface WorkoutExercise {
  exerciseId: string
  notes: string
  sets: LoggedSet[]
}

export interface Workout {
  id: string
  name: string
  start: number
  end: number
  exercises: WorkoutExercise[]
}

/** Target sets used by routines / templates. */
export interface RoutineSet {
  type: SetType
  weight: number
  reps: number
  duration: number
  distance: number
}

export interface RoutineExercise {
  exerciseId: string
  notes: string
  sets: RoutineSet[]
}

export interface Routine {
  id: string
  name: string
  createdAt: number
  exercises: RoutineExercise[]
}

export interface Settings {
  name: string
  unit: Unit
  theme: Theme
  defaultRest: number
  restAutoStart: boolean
  sound: boolean
}

export interface Post {
  id: string
  athlete: string
  handle: string
  color: string
  time: number
  workoutName: string
  muscles: string[]
  volume: number
  durationMin: number
  exercises: string[]
  likes: number
}

export interface AppState {
  active: Workout | null
  workouts: Workout[]
  routines: Routine[]
  customs: Exercise[]
  /** extra exercises loaded lazily from the bundled dataset chunk */
  dataset: Exercise[]
  settings: Settings
  liked: string[]
  comments: Record<string, string[]>
  followed: string[]
  sampleLoaded: boolean
}

export interface PR {
  exerciseId: string
  weight: number
  reps: number
  e1rm: number
  prevBest: number
}
