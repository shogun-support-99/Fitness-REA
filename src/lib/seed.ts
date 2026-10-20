import type { LoggedSet, Post, Routine, RoutineSet, SharedSet, Workout } from './types'
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

/** shared-set helper for feed snapshots */
function ss(w: number, r: number): SharedSet {
  return { type: 'normal', weight: w, reps: r, duration: 0, distance: 0 }
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
  const now = Date.now()
  return [
    {
      id: 'post-maya',
      author: { name: 'Maya Reyes', handle: 'mayalifts', color: '#ec4899', kind: 'athlete' },
      workout: {
        name: 'Push Day',
        start: now - 2 * 3600000,
        durationMin: 58,
        volumeKg: 6420,
        exercises: [
          { name: 'Bench Press', sets: [ss(60, 8), ss(60, 7), ss(62.5, 6)] },
          { name: 'Incline DB Press', sets: [ss(22, 10), ss(22, 9), ss(22, 8)] },
          { name: 'Lateral Raise', sets: [ss(10, 12), ss(10, 12)] },
          { name: 'Rope Pushdown', sets: [ss(27.5, 12), ss(27.5, 10)] },
        ],
      },
      createdAt: now - 2 * 3600000,
      likes: 24,
      likedByMe: false,
      comments: [{ name: 'Dev', text: 'Those bench numbers are flying up 🔥', at: now - 3600000 }],
    },
    {
      id: 'post-dev',
      author: { name: 'Dev Sharma', handle: 'dev.squats', color: '#3b82f6', kind: 'athlete' },
      workout: {
        name: 'Leg Day',
        start: now - 7 * 3600000,
        durationMin: 72,
        volumeKg: 9840,
        exercises: [
          { name: 'Back Squat', sets: [ss(100, 5), ss(110, 5), ss(115, 3)] },
          { name: 'Romanian Deadlift', sets: [ss(90, 8), ss(90, 8)] },
          { name: 'Leg Press', sets: [ss(180, 12), ss(180, 10)] },
          { name: 'Calf Raise', sets: [ss(80, 15), ss(80, 15)] },
        ],
      },
      createdAt: now - 7 * 3600000,
      likes: 41,
      likedByMe: false,
      comments: [],
    },
    {
      id: 'post-sofia',
      author: { name: 'Sofia Kim', handle: 'sofiaflex', color: '#f59e0b', kind: 'athlete' },
      workout: {
        name: 'Pull Day',
        start: now - 26 * 3600000,
        durationMin: 52,
        volumeKg: 5310,
        exercises: [
          { name: 'Lat Pulldown', sets: [ss(52.5, 10), ss(52.5, 9)] },
          { name: 'Barbell Row', sets: [ss(62.5, 8), ss(62.5, 8)] },
          { name: 'Face Pull', sets: [ss(17.5, 15), ss(17.5, 15)] },
          { name: 'EZ Bar Curl', sets: [ss(22.5, 10), ss(22.5, 9)] },
        ],
      },
      createdAt: now - 26 * 3600000,
      likes: 17,
      likedByMe: false,
      comments: [],
    },
    {
      id: 'post-jonas',
      author: { name: 'Jonas Weber', handle: 'jonasruns', color: '#22c55e', kind: 'athlete' },
      workout: {
        name: 'Easy 5K',
        start: now - 38 * 3600000,
        durationMin: 31,
        volumeKg: 0,
        exercises: [{ name: 'Outdoor Run', sets: [{ type: 'normal', weight: 0, reps: 0, duration: 31, distance: 5.2 }] }],
      },
      createdAt: now - 38 * 3600000,
      likes: 9,
      likedByMe: false,
      comments: [],
    },
  ]
}
