/**
 * Body distribution — turns real workout history into per-muscle set counts
 * for the heatmap + table screen. Pure functions, no React.
 *
 * Counting rules (explained in the screen's help sheet):
 *  - a completed set counts fully toward the exercise's primary muscle
 *  - it counts half toward each secondary muscle
 *  - "Full Body" exercises count half toward the eight major groups
 *  - cardio contributes no muscle sets
 * Internally counts are kept in half-set units (integers) so 0.5 never
 * turns into 0.49999; divide by 2 only for display.
 */
import type { Exercise, Workout } from './types'

export type MuscleId =
  | 'back'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'core'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'quads'
  | 'shoulders'
  | 'traps'
  | 'triceps'

/** alphabetical, as shown in the table */
export const MUSCLES: ReadonlyArray<{ id: MuscleId; label: string }> = [
  { id: 'back', label: 'Back' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'calves', label: 'Calves' },
  { id: 'chest', label: 'Chest' },
  { id: 'core', label: 'Core' },
  { id: 'forearms', label: 'Forearms' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'quads', label: 'Quads' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'traps', label: 'Traps' },
  { id: 'triceps', label: 'Triceps' },
]

export type MuscleSets = Record<MuscleId, number>

/** "Full Body" exercises spread half a set across the major groups */
const FULL_BODY_TARGETS: MuscleId[] = [
  'back',
  'biceps',
  'chest',
  'core',
  'glutes',
  'hamstrings',
  'quads',
  'triceps',
]

const emptySets = (): MuscleSets => ({
  back: 0,
  biceps: 0,
  calves: 0,
  chest: 0,
  core: 0,
  forearms: 0,
  glutes: 0,
  hamstrings: 0,
  quads: 0,
  shoulders: 0,
  traps: 0,
  triceps: 0,
})

const normalize = (m: string) => m.trim().toLowerCase()

function muscleId(raw: string): MuscleId | null {
  switch (normalize(raw)) {
    case 'back':
    case 'lats':
    case 'lower back':
    case 'back extensors':
      return 'back'
    case 'biceps':
      return 'biceps'
    case 'calves':
    case 'calf':
      return 'calves'
    case 'chest':
    case 'pectorals':
      return 'chest'
    case 'abs':
    case 'abdominals':
    case 'core':
    case 'obliques':
      return 'core'
    case 'forearms':
      return 'forearms'
    case 'glutes':
    case 'glute':
      return 'glutes'
    case 'hamstrings':
      return 'hamstrings'
    case 'quads':
    case 'quadriceps':
      return 'quads'
    case 'shoulders':
    case 'delts':
    case 'deltoids':
      return 'shoulders'
    case 'traps':
    case 'trapezius':
      return 'traps'
    case 'triceps':
      return 'triceps'
    default:
      return null
  }
}

/**
 * Sum completed sets per muscle for workouts starting in [from, to).
 * `resolve` maps an exercise id to its definition (primary/secondary muscles).
 */
export function muscleSets(
  workouts: Workout[],
  from: number,
  to: number,
  resolve: (exerciseId: string) => Exercise | undefined
): MuscleSets {
  const out = emptySets()
  for (const w of workouts) {
    if (w.start < from || w.start >= to) continue
    for (const ex of w.exercises) {
      const meta = resolve(ex.exerciseId)
      if (!meta) continue
      const doneSets = ex.sets.filter((s) => s.done).length
      if (doneSets === 0) continue
      if (normalize(meta.primary) === 'cardio') continue
      if (normalize(meta.primary) === 'full body') {
        for (const m of FULL_BODY_TARGETS) out[m] += doneSets
        continue
      }
      const primary = muscleId(meta.primary)
      if (primary) out[primary] += doneSets * 2
      for (const raw of meta.secondary ?? []) {
        if (normalize(raw) === 'cardio' || normalize(raw) === 'full body') continue
        const secondary = muscleId(raw)
        if (secondary && secondary !== primary) out[secondary] += doneSets
      }
    }
  }
  return out
}

export const totalSets = (sets: MuscleSets): number =>
  MUSCLES.reduce((sum, m) => sum + sets[m.id], 0)

/** half-set units -> display string ("12", "12.5") */
export function setsLabel(halfUnits: number): string {
  const whole = Math.floor(halfUnits / 2)
  return halfUnits % 2 === 0 ? String(whole) : `${whole}.5`
}

/** intensity bucket for the heatmap: 0 sets / 1-4 / 5-9 / 10+ */
export function levelFor(halfUnits: number): 0 | 1 | 2 | 3 {
  const sets = halfUnits / 2
  if (sets <= 0) return 0
  if (sets < 5) return 1
  if (sets < 10) return 2
  return 3
}

export const LEVEL_LABELS = ['0', '1–4', '5–9', '10+'] as const
