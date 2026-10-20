import type { LoggedSet, Post, Routine, RoutineSet, Workout } from './types'
import { uid } from './utils'

const DAY = 86400000

function at(daysAgo: number, h: number, m: number): number {
  const d = new Date(Date.now() - daysAgo * DAY)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

/** [weightKg, reps] strength set (marked done) */
function s(w: number, r: number, type: LoggedSet['type'] = 'normal'): LoggedSet {
  return { type, weight: w, reps: r, duration: 0, distance: 0, done: true }
}

/** cardio set: minutes, km */
function c(min: number, km: number): LoggedSet {
  return { type: 'normal', weight: 0, reps: 0, duration: min, distance: km, done: true }
}

function rs(w: number, r: number, type: RoutineSet['type'] = 'normal'): RoutineSet {
  return { type, weight: w, reps: r, duration: 0, distance: 0 }
}

export function sampleWorkouts(): Workout[] {
  return [
    {
      id: uid(),
      name: 'Full Body',
      start: at(1, 18, 5),
      end: at(1, 19, 16),
      exercises: [
        { exerciseId: 'back-squat', notes: '', sets: [s(80, 5), s(80, 5), s(80, 5)] },
        { exerciseId: 'barbell-bench-press', notes: '', sets: [s(62.5, 6), s(62.5, 5), s(62.5, 5)] },
        { exerciseId: 'barbell-row', notes: 'Focused on squeezing at the top', sets: [s(60, 8), s(60, 8)] },
        { exerciseId: 'kettlebell-swing', notes: '', sets: [s(24, 15), s(24, 15)] },
        { exerciseId: 'hanging-knee-raise', notes: '', sets: [s(0, 12), s(0, 12)] },
      ],
    },
    {
      id: uid(),
      name: 'Pull Day',
      start: at(3, 18, 30),
      end: at(3, 19, 42),
      exercises: [
        { exerciseId: 'lat-pulldown', notes: '', sets: [s(52.5, 10), s(52.5, 9), s(52.5, 9)] },
        { exerciseId: 'barbell-row', notes: '', sets: [s(62.5, 8), s(62.5, 8), s(60, 8)] },
        { exerciseId: 'face-pull', notes: '', sets: [s(17.5, 15), s(17.5, 15)] },
        { exerciseId: 'ez-bar-curl', notes: '', sets: [s(22.5, 9), s(22.5, 8), s(22.5, 7)] },
        { exerciseId: 'hammer-curl', notes: '', sets: [s(12, 12), s(12, 10)] },
      ],
    },
    {
      id: uid(),
      name: 'Leg Day',
      start: at(6, 7, 15),
      end: at(6, 8, 30),
      exercises: [
        { exerciseId: 'back-squat', notes: '', sets: [s(45, 8, 'warmup'), s(82.5, 8), s(82.5, 7), s(82.5, 6)] },
        { exerciseId: 'romanian-deadlift', notes: '', sets: [s(72.5, 8), s(72.5, 8)] },
        { exerciseId: 'leg-press', notes: '', sets: [s(130, 10), s(130, 9)] },
        { exerciseId: 'standing-calf-raise', notes: '', sets: [s(62.5, 14), s(62.5, 12), s(62.5, 12)] },
        { exerciseId: 'plank', notes: '', sets: [c(2, 0), c(1.5, 0)] },
      ],
    },
    {
      id: uid(),
      name: 'Push Day',
      start: at(8, 18, 20),
      end: at(8, 19, 25),
      exercises: [
        { exerciseId: 'barbell-bench-press', notes: '', sets: [s(40, 10, 'warmup'), s(62.5, 8), s(62.5, 7), s(62.5, 6)] },
        { exerciseId: 'incline-dumbbell-press', notes: '', sets: [s(24, 10), s(24, 9), s(24, 8)] },
        { exerciseId: 'lateral-raise', notes: '', sets: [s(10, 12), s(10, 11), s(10, 11)] },
        { exerciseId: 'tricep-pushdown', notes: '', sets: [s(27.5, 12), s(27.5, 11), s(27.5, 10)] },
      ],
    },
    {
      id: uid(),
      name: 'Upper Body',
      start: at(10, 18, 0),
      end: at(10, 19, 5),
      exercises: [
        { exerciseId: 'overhead-press', notes: '', sets: [s(40, 6), s(40, 5), s(40, 5)] },
        { exerciseId: 'dumbbell-row', notes: '', sets: [s(28, 10), s(28, 9)] },
        { exerciseId: 'barbell-bench-press', notes: '', sets: [s(62.5, 6), s(62.5, 5)] },
        { exerciseId: 'rope-pushdown', notes: '', sets: [s(22.5, 12), s(22.5, 11)] },
        { exerciseId: 'barbell-curl', notes: '', sets: [s(30, 10), s(30, 8)] },
      ],
    },
    {
      id: uid(),
      name: 'Leg Day',
      start: at(13, 7, 30),
      end: at(13, 8, 45),
      exercises: [
        { exerciseId: 'back-squat', notes: '', sets: [s(80, 8), s(80, 7), s(80, 6), s(80, 5)] },
        { exerciseId: 'romanian-deadlift', notes: '', sets: [s(70, 8), s(70, 8)] },
        { exerciseId: 'leg-press', notes: '', sets: [s(120, 10), s(120, 9)] },
        { exerciseId: 'seated-calf-raise', notes: '', sets: [s(50, 15), s(50, 15)] },
      ],
    },
    {
      id: uid(),
      name: 'Pull Day',
      start: at(15, 18, 40),
      end: at(15, 19, 50),
      exercises: [
        { exerciseId: 'lat-pulldown', notes: '', sets: [s(50, 10), s(50, 9), s(50, 8)] },
        { exerciseId: 'barbell-row', notes: '', sets: [s(60, 8), s(60, 8), s(57.5, 7)] },
        { exerciseId: 'face-pull', notes: '', sets: [s(15, 15), s(15, 15)] },
        { exerciseId: 'ez-bar-curl', notes: '', sets: [s(20, 10), s(20, 9), s(20, 8)] },
      ],
    },
    {
      id: uid(),
      name: 'Push Day',
      start: at(17, 18, 10),
      end: at(17, 19, 20),
      exercises: [
        { exerciseId: 'barbell-bench-press', notes: '', sets: [s(60, 8), s(60, 7), s(60, 6)] },
        { exerciseId: 'incline-dumbbell-press', notes: '', sets: [s(22, 10), s(22, 9), s(22, 8)] },
        { exerciseId: 'lateral-raise', notes: '', sets: [s(10, 12), s(10, 12), s(10, 10)] },
        { exerciseId: 'tricep-pushdown', notes: '', sets: [s(25, 12), s(25, 10), s(25, 10)] },
      ],
    },
  ]
}

export function sampleRoutines(): Routine[] {
  return [
    {
      id: uid(),
      name: 'Push Day',
      createdAt: at(20, 10, 0),
      exercises: [
        { exerciseId: 'barbell-bench-press', notes: '', sets: [rs(60, 8), rs(60, 8), rs(60, 8)] },
        { exerciseId: 'incline-dumbbell-press', notes: '', sets: [rs(24, 10), rs(24, 10), rs(24, 10)] },
        { exerciseId: 'lateral-raise', notes: '', sets: [rs(10, 12), rs(10, 12), rs(10, 12)] },
        { exerciseId: 'tricep-pushdown', notes: '', sets: [rs(27.5, 12), rs(27.5, 12)] },
      ],
    },
    {
      id: uid(),
      name: 'Pull Day',
      createdAt: at(20, 10, 5),
      exercises: [
        { exerciseId: 'lat-pulldown', notes: '', sets: [rs(52.5, 10), rs(52.5, 10), rs(52.5, 10)] },
        { exerciseId: 'barbell-row', notes: '', sets: [rs(62.5, 8), rs(62.5, 8), rs(62.5, 8)] },
        { exerciseId: 'face-pull', notes: '', sets: [rs(17.5, 15), rs(17.5, 15)] },
        { exerciseId: 'ez-bar-curl', notes: '', sets: [rs(22.5, 10), rs(22.5, 10)] },
      ],
    },
    {
      id: uid(),
      name: 'Leg Day',
      createdAt: at(20, 10, 10),
      exercises: [
        { exerciseId: 'back-squat', notes: '', sets: [rs(45, 8, 'warmup'), rs(82.5, 8), rs(82.5, 8), rs(82.5, 8)] },
        { exerciseId: 'romanian-deadlift', notes: '', sets: [rs(72.5, 8), rs(72.5, 8)] },
        { exerciseId: 'leg-press', notes: '', sets: [rs(130, 10), rs(130, 10)] },
        { exerciseId: 'standing-calf-raise', notes: '', sets: [rs(62.5, 12), rs(62.5, 12), rs(62.5, 12)] },
      ],
    },
    {
      id: uid(),
      name: '5K Easy Run',
      createdAt: at(18, 9, 0),
      exercises: [
        { exerciseId: 'treadmill-run', notes: 'Zone 2 pace', sets: [{ type: 'normal', weight: 0, reps: 0, duration: 32, distance: 5.2 }] },
      ],
    },
  ]
}

export function samplePosts(): Post[] {
  return [
    {
      id: 'post-maya',
      athlete: 'Maya Reyes',
      handle: 'mayalifts',
      color: '#ec4899',
      time: Date.now() - 2 * 3600000,
      workoutName: 'Push Day',
      muscles: ['Chest', 'Shoulders', 'Triceps'],
      volume: 6420,
      durationMin: 58,
      exercises: ['Bench Press', 'Incline DB Press', 'Lateral Raise', 'Rope Pushdown'],
      likes: 24,
    },
    {
      id: 'post-dev',
      athlete: 'Dev Sharma',
      handle: 'dev.squats',
      color: '#3b82f6',
      time: Date.now() - 7 * 3600000,
      workoutName: 'Leg Day',
      muscles: ['Quads', 'Glutes', 'Calves'],
      volume: 9840,
      durationMin: 72,
      exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise'],
      likes: 41,
    },
    {
      id: 'post-sofia',
      athlete: 'Sofia Kim',
      handle: 'sofiaflex',
      color: '#f59e0b',
      time: Date.now() - 26 * 3600000,
      workoutName: 'Pull Day',
      muscles: ['Back', 'Biceps'],
      volume: 5310,
      durationMin: 52,
      exercises: ['Lat Pulldown', 'Barbell Row', 'Face Pull', 'EZ Bar Curl'],
      likes: 17,
    },
    {
      id: 'post-jonas',
      athlete: 'Jonas Weber',
      handle: 'jonasruns',
      color: '#22c55e',
      time: Date.now() - 38 * 3600000,
      workoutName: 'Easy 5K',
      muscles: ['Cardio'],
      volume: 0,
      durationMin: 31,
      exercises: ['Outdoor Run'],
      likes: 9,
    },
  ]
}
