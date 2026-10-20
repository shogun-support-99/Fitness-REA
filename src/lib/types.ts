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

/** Who wrote a feed post: you, one of your contacts, or a seeded athlete. */
export interface PostAuthor {
  name: string
  handle: string
  color: string
  kind: 'me' | 'contact' | 'athlete'
}

/** A workout snapshot embedded in a post — survives independently of logs. */
export interface SharedSet {
  type: SetType
  weight: number
  reps: number
  duration: number
  distance: number
}

export interface SharedExercise {
  name: string
  sets: SharedSet[]
}

export interface SharedWorkout {
  name: string
  start: number
  durationMin: number
  volumeKg: number
  exercises: SharedExercise[]
}

export interface PostComment {
  name: string
  text: string
  at: number
}

export interface Post {
  id: string
  author: PostAuthor
  workout: SharedWorkout
  /** set when the post was shared from one of this account's own workouts */
  workoutId?: string
  createdAt: number
  likes: number
  likedByMe: boolean
  comments: PostComment[]
}

export interface Contact {
  id: string
  name: string
  handle: string
  color: string
  followed: boolean
  addedAt: number
}

/** Local-first account. Passwords never leave this device. */
export interface Account {
  id: string
  name: string
  handle: string
  email: string
  kind: 'local' | 'guest'
  color: string
  salt: string
  hash: string
  createdAt: number
}

export interface AppState {
  active: Workout | null
  workouts: Workout[]
  routines: Routine[]
  customs: Exercise[]
  /** the full bundled exercise library */
  dataset: Exercise[]
  settings: Settings
  posts: Post[]
  contacts: Contact[]
  /** handles of seeded athletes the user follows */
  followedHandles: string[]
  sampleLoaded: boolean
}

export interface PR {
  exerciseId: string
  weight: number
  reps: number
  e1rm: number
  prevBest: number
}
