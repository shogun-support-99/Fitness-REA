import type { LoggedSet, Routine, Unit, Workout, WorkoutExercise, PR } from './types'

export const KG_TO_LB = 2.20462262185

export const uid = (): string =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

/* ---------- units ---------- */

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** kg -> display value in the active unit */
export function toDisplayVal(kg: number, unit: Unit): number {
  return unit === 'kg' ? round1(kg) : round1(kg * KG_TO_LB)
}

/** display value in active unit -> kg */
export function toKg(val: number, unit: Unit): number {
  return unit === 'kg' ? val : val / KG_TO_LB
}

export function fmtNum(n: number): string {
  const r = round1(n)
  if (Number.isInteger(r)) return String(r)
  return r.toFixed(1)
}

export function fmtWeight(kg: number, unit: Unit): string {
  const v = toDisplayVal(kg, unit)
  if (v >= 1000) return `${Math.round(v)}`
  return fmtNum(v)
}

export function fmtVolume(kg: number, unit: Unit): string {
  const v = toDisplayVal(kg, unit)
  if (v >= 100000) return `${Math.round(v / 1000)}k`
  if (v >= 1000) return `${round1(v / 1000)}k`
  return fmtNum(v)
}

/* ---------- training math ---------- */

/** Epley one-rep max estimate. */
export function e1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function setE1RM(s: LoggedSet): number {
  return e1RM(s.weight, s.reps)
}

export function bestSetE1RM(sets: LoggedSet[]): number {
  return sets.reduce((m, s) => Math.max(m, setE1RM(s)), 0)
}

export function exerciseVolume(sets: LoggedSet[]): number {
  return sets
    .filter((s) => s.done && s.type !== 'warmup')
    .reduce((sum, s) => sum + s.weight * s.reps, 0)
}

export function workoutVolume(w: Workout): number {
  return w.exercises.reduce((sum, e) => sum + exerciseVolume(e.sets), 0)
}

export function workoutSetCount(w: Workout): number {
  return w.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0)
}

export function durationOf(w: Workout): number {
  return Math.max(0, w.end - w.start)
}

/** PRs achieved in `workout` relative to all workouts before it. */
export function computePRs(workout: Workout, priorWorkouts: Workout[]): PR[] {
  const prs: PR[] = []
  for (const ex of workout.exercises) {
    const best = bestSetE1RM(ex.sets)
    if (best <= 0) continue
    let prevBest = 0
    for (const pw of priorWorkouts) {
      for (const pe of pw.exercises) {
        if (pe.exerciseId === ex.exerciseId) {
          prevBest = Math.max(prevBest, bestSetE1RM(pe.sets))
        }
      }
    }
    if (best > prevBest) {
      const bestSet = [...ex.sets].sort((a, b) => setE1RM(b) - setE1RM(a))[0]
      prs.push({
        exerciseId: ex.exerciseId,
        weight: bestSet.weight,
        reps: bestSet.reps,
        e1rm: best,
        prevBest,
      })
    }
  }
  return prs
}

/* ---------- time & dates ---------- */

export function fmtDuration(ms: number): string {
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

export function fmtElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const two = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${two(m)}:${two(sec)}`
}

export function fmtClock(ms: number): string {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function fmtDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const y = d.getFullYear() === now.getFullYear() ? '' : `, ${d.getFullYear()}`
  return `${MONTHS[d.getMonth()]} ${d.getDate()}${y}`
}

export function fmtDateLong(ts: number): string {
  const d = new Date(ts)
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function fmtTime(ts: number): string {
  const d = new Date(ts)
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return fmtDate(ts)
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Monday-based week start. */
export function weekStart(ts: number): number {
  const d = new Date(ts)
  const day = (d.getDay() + 6) % 7
  d.setHours(0, 0, 0, 0)
  return d.getTime() - day * 86400000
}

/** Consecutive days (ending today or yesterday) that contain at least one workout. */
export function workoutStreak(workouts: Workout[]): number {
  const days = new Set(workouts.map((w) => dayKey(w.start)))
  if (days.size === 0) return 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  let streak = 0
  // allow the streak to be "alive" if today has no workout yet but yesterday does
  if (!days.has(dayKey(d.getTime()))) d.setTime(d.getTime() - 86400000)
  while (days.has(dayKey(d.getTime()))) {
    streak++
    d.setTime(d.getTime() - 86400000)
  }
  return streak
}

export function lastPerformance(
  workouts: Workout[],
  exerciseId: string,
  beforeTs: number
): WorkoutExercise | null {
  // workouts are stored newest-first
  const sorted = [...workouts].sort((a, b) => b.start - a.start)
  for (const w of sorted) {
    if (w.start >= beforeTs) continue
    const ex = w.exercises.find((e) => e.exerciseId === exerciseId)
    if (ex && ex.sets.length > 0) return ex
  }
  return null
}

export function summarizePrev(ex: WorkoutExercise, unit: Unit): string {
  const sets = ex.sets.filter((s) => s.done || s.weight > 0 || s.reps > 0)
  if (sets.length === 0) return '—'
  const parts = sets.map((s) =>
    s.weight > 0 ? `${fmtWeight(s.weight, unit)}×${s.reps}` : `${s.reps}`
  )
  return parts.slice(0, 4).join(', ')
}

export function beep(times = 2): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.28)
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.28 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.28 + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.28)
      osc.stop(ctx.currentTime + i * 0.28 + 0.24)
    }
    setTimeout(() => ctx.close(), 1200)
  } catch {
    /* audio not available */
  }
}

export function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/* ---------- Hevy-style warm-up generator & routine diffing ---------- */

/**
 * Percentage-based warm-up ladder (Hevy's Warm-Up Sets Calculator):
 * 50% x 5, 70% x 3, 90% x 1 before the first working set, rounded to
 * the nearest sensible plate/dumbbell increment for the unit.
 */
export function warmupSets(targetKg: number, unit: 'kg' | 'lb'): { type: 'warmup'; weight: number; reps: number }[] {
  const round = unit === 'kg' ? (v: number) => Math.round(v / 2.5) * 2.5 : (v: number) => Math.round(v / 5) * 5
  const steps: [number, number][] = [
    [0.5, 5],
    [0.7, 3],
    [0.9, 1],
  ]
  return steps
    .map(([pct, reps]) => ({ type: 'warmup' as const, weight: Math.max(round(targetKg * pct), 0), reps }))
    .filter((s) => s.weight > 0)
}

/**
 * Does the live workout still match the routine it was started from?
 * Compares exercise order/ids and per-exercise set counts + types.
 */
export function workoutMatchesRoutine(w: Workout, r: Routine): boolean {
  if (w.exercises.length !== r.exercises.length) return false
  return w.exercises.every((we, i) => {
    const re = r.exercises[i]
    if (!re || we.exerciseId !== re.exerciseId) return false
    if (we.sets.length !== re.sets.length) return false
    return we.sets.every((s, j) => s.type === re.sets[j].type)
  })
}

/** Rebuild a routine template from a finished workout (keeps id/name). */
export function routineFromWorkout(w: Workout, r: Routine): Routine {
  return {
    id: r.id,
    name: r.name,
    createdAt: r.createdAt,
    exercises: w.exercises.map((we) => ({
      exerciseId: we.exerciseId,
      notes: we.notes,
      sets: we.sets.map((s) => ({
        type: s.type,
        weight: s.weight,
        reps: s.reps,
        duration: s.duration,
        distance: s.distance,
      })),
    })),
  }
}
