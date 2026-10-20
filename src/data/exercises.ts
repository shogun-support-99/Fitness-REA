import type { Equipment, Exercise, MuscleGroup } from '../lib/types'
import { CURATED_ENRICHMENTS } from './curated-enrichments'

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'Chest', label: 'Chest' },
  { id: 'Back', label: 'Back' },
  { id: 'Traps', label: 'Traps' },
  { id: 'Shoulders', label: 'Shoulders' },
  { id: 'Biceps', label: 'Biceps' },
  { id: 'Triceps', label: 'Triceps' },
  { id: 'Forearms', label: 'Forearms' },
  { id: 'Quads', label: 'Quads' },
  { id: 'Hamstrings', label: 'Hamstrings' },
  { id: 'Glutes', label: 'Glutes' },
  { id: 'Calves', label: 'Calves' },
  { id: 'Core', label: 'Core' },
  { id: 'Full Body', label: 'Full Body' },
  { id: 'Cardio', label: 'Cardio' },
]

export const MUSCLE_LABEL: Record<MuscleGroup, string> = MUSCLE_GROUPS.reduce(
  (acc, m) => ({ ...acc, [m.id]: m.label }),
  {} as Record<MuscleGroup, string>
)

export const EQUIPMENTS: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Kettlebell',
  'Band',
  'Other',
]

type Category = 'strength' | 'cardio'
type Row = [string, string, Equipment, MuscleGroup, MuscleGroup[], Category?]

// [id, name, equipment, primary, secondary, category?, custom?]
const ROWS: Row[] = [
  // Chest
  ['barbell-bench-press', 'Barbell Bench Press', 'Barbell', 'Chest', ['Triceps', 'Shoulders']],
  ['incline-barbell-bench-press', 'Incline Barbell Bench Press', 'Barbell', 'Chest', ['Shoulders', 'Triceps']],
  ['decline-barbell-bench-press', 'Decline Barbell Bench Press', 'Barbell', 'Chest', ['Triceps']],
  ['dumbbell-bench-press', 'Dumbbell Bench Press', 'Dumbbell', 'Chest', ['Triceps', 'Shoulders']],
  ['incline-dumbbell-press', 'Incline Dumbbell Press', 'Dumbbell', 'Chest', ['Shoulders', 'Triceps']],
  ['decline-dumbbell-press', 'Decline Dumbbell Press', 'Dumbbell', 'Chest', ['Triceps']],
  ['dumbbell-fly', 'Dumbbell Fly', 'Dumbbell', 'Chest', ['Shoulders']],
  ['incline-dumbbell-fly', 'Incline Dumbbell Fly', 'Dumbbell', 'Chest', ['Shoulders']],
  ['cable-fly', 'Cable Fly', 'Cable', 'Chest', ['Shoulders']],
  ['cable-crossover', 'Cable Crossover', 'Cable', 'Chest', ['Shoulders']],
  ['pec-deck', 'Pec Deck', 'Machine', 'Chest', []],
  ['machine-chest-press', 'Machine Chest Press', 'Machine', 'Chest', ['Triceps']],
  ['chest-dip', 'Chest Dip', 'Bodyweight', 'Chest', ['Triceps', 'Shoulders']],
  ['push-up', 'Push Up', 'Bodyweight', 'Chest', ['Triceps', 'Core']],
  ['smith-machine-bench-press', 'Smith Machine Bench Press', 'Machine', 'Chest', ['Triceps']],
  // Back
  ['deadlift', 'Deadlift', 'Barbell', 'Back', ['Hamstrings', 'Glutes', 'Traps']],
  ['barbell-row', 'Barbell Row', 'Barbell', 'Back', ['Biceps', 'Traps']],
  ['pendlay-row', 'Pendlay Row', 'Barbell', 'Back', ['Biceps', 'Traps']],
  ['t-bar-row', 'T-Bar Row', 'Machine', 'Back', ['Biceps']],
  ['dumbbell-row', 'Dumbbell Row', 'Dumbbell', 'Back', ['Biceps']],
  ['seated-cable-row', 'Seated Cable Row', 'Cable', 'Back', ['Biceps']],
  ['lat-pulldown', 'Lat Pulldown', 'Cable', 'Back', ['Biceps']],
  ['pull-up', 'Pull Up', 'Bodyweight', 'Back', ['Biceps', 'Traps']],
  ['chin-up', 'Chin Up', 'Bodyweight', 'Back', ['Biceps']],
  ['straight-arm-pulldown', 'Straight-Arm Pulldown', 'Cable', 'Back', ['Triceps']],
  ['rack-pull', 'Rack Pull', 'Barbell', 'Back', ['Traps', 'Glutes']],
  ['face-pull', 'Face Pull', 'Cable', 'Back', ['Shoulders']],
  ['hyperextension', 'Hyperextension', 'Bodyweight', 'Back', ['Glutes', 'Hamstrings']],
  // Traps
  ['barbell-shrug', 'Barbell Shrug', 'Barbell', 'Traps', ['Back']],
  ['dumbbell-shrug', 'Dumbbell Shrug', 'Dumbbell', 'Traps', ['Back']],
  // Shoulders
  ['overhead-press', 'Overhead Press', 'Barbell', 'Shoulders', ['Triceps', 'Core']],
  ['seated-dumbbell-shoulder-press', 'Seated Dumbbell Shoulder Press', 'Dumbbell', 'Shoulders', ['Triceps']],
  ['arnold-press', 'Arnold Press', 'Dumbbell', 'Shoulders', ['Triceps']],
  ['lateral-raise', 'Lateral Raise', 'Dumbbell', 'Shoulders', ['Traps']],
  ['cable-lateral-raise', 'Cable Lateral Raise', 'Cable', 'Shoulders', ['Traps']],
  ['front-raise', 'Front Raise', 'Dumbbell', 'Shoulders', ['Chest']],
  ['rear-delt-fly', 'Rear Delt Fly', 'Dumbbell', 'Shoulders', ['Back']],
  ['cable-rear-delt-fly', 'Cable Rear Delt Fly', 'Cable', 'Shoulders', ['Back']],
  ['upright-row', 'Upright Row', 'Barbell', 'Shoulders', ['Traps', 'Biceps']],
  ['machine-shoulder-press', 'Machine Shoulder Press', 'Machine', 'Shoulders', ['Triceps']],
  // Biceps
  ['barbell-curl', 'Barbell Curl', 'Barbell', 'Biceps', ['Forearms']],
  ['ez-bar-curl', 'EZ Bar Curl', 'Barbell', 'Biceps', ['Forearms']],
  ['dumbbell-curl', 'Dumbbell Curl', 'Dumbbell', 'Biceps', ['Forearms']],
  ['hammer-curl', 'Hammer Curl', 'Dumbbell', 'Biceps', ['Forearms']],
  ['incline-dumbbell-curl', 'Incline Dumbbell Curl', 'Dumbbell', 'Biceps', []],
  ['preacher-curl', 'Preacher Curl', 'Machine', 'Biceps', ['Forearms']],
  ['cable-curl', 'Cable Curl', 'Cable', 'Biceps', ['Forearms']],
  ['concentration-curl', 'Concentration Curl', 'Dumbbell', 'Biceps', []],
  ['spider-curl', 'Spider Curl', 'Dumbbell', 'Biceps', []],
  // Triceps
  ['close-grip-bench-press', 'Close-Grip Bench Press', 'Barbell', 'Triceps', ['Chest']],
  ['tricep-dip', 'Tricep Dip', 'Bodyweight', 'Triceps', ['Chest', 'Shoulders']],
  ['tricep-pushdown', 'Tricep Pushdown', 'Cable', 'Triceps', []],
  ['rope-pushdown', 'Rope Pushdown', 'Cable', 'Triceps', []],
  ['skull-crusher', 'Skull Crusher', 'Barbell', 'Triceps', []],
  ['overhead-tricep-extension', 'Overhead Tricep Extension', 'Dumbbell', 'Triceps', []],
  ['cable-overhead-extension', 'Cable Overhead Extension', 'Cable', 'Triceps', []],
  ['dumbbell-kickback', 'Dumbbell Kickback', 'Dumbbell', 'Triceps', []],
  ['bench-dip', 'Bench Dip', 'Bodyweight', 'Triceps', ['Shoulders']],
  // Forearms
  ['wrist-curl', 'Wrist Curl', 'Dumbbell', 'Forearms', []],
  ['reverse-wrist-curl', 'Reverse Wrist Curl', 'Dumbbell', 'Forearms', []],
  ['reverse-curl', 'Reverse Curl', 'Barbell', 'Forearms', ['Biceps']],
  ['farmers-walk', "Farmer's Walk", 'Dumbbell', 'Forearms', ['Traps', 'Core']],
  // Quads
  ['back-squat', 'Back Squat', 'Barbell', 'Quads', ['Glutes', 'Core']],
  ['front-squat', 'Front Squat', 'Barbell', 'Quads', ['Glutes', 'Core']],
  ['goblet-squat', 'Goblet Squat', 'Kettlebell', 'Quads', ['Glutes', 'Core']],
  ['hack-squat', 'Hack Squat', 'Machine', 'Quads', ['Glutes']],
  ['leg-press', 'Leg Press', 'Machine', 'Quads', ['Glutes']],
  ['leg-extension', 'Leg Extension', 'Machine', 'Quads', []],
  ['bulgarian-split-squat', 'Bulgarian Split Squat', 'Dumbbell', 'Quads', ['Glutes', 'Hamstrings']],
  ['lunge', 'Lunge', 'Bodyweight', 'Quads', ['Glutes']],
  ['walking-lunge', 'Walking Lunge', 'Dumbbell', 'Quads', ['Glutes']],
  ['step-up', 'Step Up', 'Dumbbell', 'Quads', ['Glutes']],
  ['smith-machine-squat', 'Smith Machine Squat', 'Machine', 'Quads', ['Glutes']],
  // Hamstrings
  ['romanian-deadlift', 'Romanian Deadlift', 'Barbell', 'Hamstrings', ['Glutes', 'Back']],
  ['stiff-leg-deadlift', 'Stiff-Leg Deadlift', 'Barbell', 'Hamstrings', ['Glutes']],
  ['lying-leg-curl', 'Lying Leg Curl', 'Machine', 'Hamstrings', ['Calves']],
  ['seated-leg-curl', 'Seated Leg Curl', 'Machine', 'Hamstrings', ['Calves']],
  ['nordic-curl', 'Nordic Curl', 'Bodyweight', 'Hamstrings', ['Glutes']],
  // Glutes
  ['hip-thrust', 'Hip Thrust', 'Barbell', 'Glutes', ['Hamstrings']],
  ['barbell-glute-bridge', 'Barbell Glute Bridge', 'Barbell', 'Glutes', ['Hamstrings']],
  ['cable-kickback', 'Cable Kickback', 'Cable', 'Glutes', ['Hamstrings']],
  ['glute-bridge', 'Glute Bridge', 'Bodyweight', 'Glutes', ['Hamstrings']],
  // Calves
  ['standing-calf-raise', 'Standing Calf Raise', 'Machine', 'Calves', []],
  ['seated-calf-raise', 'Seated Calf Raise', 'Machine', 'Calves', []],
  ['leg-press-calf-raise', 'Leg Press Calf Raise', 'Machine', 'Calves', []],
  ['single-leg-calf-raise', 'Single-Leg Calf Raise', 'Bodyweight', 'Calves', []],
  // Core
  ['hanging-leg-raise', 'Hanging Leg Raise', 'Bodyweight', 'Core', ['Quads']],
  ['hanging-knee-raise', 'Hanging Knee Raise', 'Bodyweight', 'Core', []],
  ['ab-wheel-rollout', 'Ab Wheel Rollout', 'Other', 'Core', ['Shoulders']],
  ['crunch', 'Crunch', 'Bodyweight', 'Core', []],
  ['cable-crunch', 'Cable Crunch', 'Cable', 'Core', []],
  ['russian-twist', 'Russian Twist', 'Bodyweight', 'Core', []],
  ['dead-bug', 'Dead Bug', 'Bodyweight', 'Core', []],
  ['mountain-climber', 'Mountain Climber', 'Bodyweight', 'Core', ['Cardio']],
  ['plank', 'Plank', 'Bodyweight', 'Core', [], 'cardio'],
  ['side-plank', 'Side Plank', 'Bodyweight', 'Core', [], 'cardio'],
  // Full body
  ['burpee', 'Burpee', 'Bodyweight', 'Full Body', ['Cardio']],
  ['clean-and-jerk', 'Clean and Jerk', 'Barbell', 'Full Body', ['Quads', 'Shoulders', 'Traps']],
  ['snatch', 'Snatch', 'Barbell', 'Full Body', ['Quads', 'Shoulders', 'Traps']],
  ['kettlebell-swing', 'Kettlebell Swing', 'Kettlebell', 'Full Body', ['Glutes', 'Hamstrings']],
  ['thruster', 'Thruster', 'Barbell', 'Full Body', ['Quads', 'Shoulders']],
  ['turkish-get-up', 'Turkish Get Up', 'Kettlebell', 'Full Body', ['Core', 'Shoulders']],
  // Cardio
  ['treadmill-run', 'Treadmill Run', 'Machine', 'Cardio', ['Quads'], 'cardio'],
  ['outdoor-run', 'Outdoor Run', 'Bodyweight', 'Cardio', ['Quads'], 'cardio'],
  ['indoor-cycling', 'Indoor Cycling', 'Machine', 'Cardio', ['Quads'], 'cardio'],
  ['rowing-machine', 'Rowing Machine', 'Machine', 'Cardio', ['Back'], 'cardio'],
  ['elliptical', 'Elliptical', 'Machine', 'Cardio', ['Full Body'], 'cardio'],
  ['jump-rope', 'Jump Rope', 'Bodyweight', 'Cardio', ['Calves'], 'cardio'],
  ['stair-climber', 'Stair Climber', 'Machine', 'Cardio', ['Glutes'], 'cardio'],
]

export const EXERCISES: Exercise[] = ROWS.map(([id, name, equipment, primary, secondary, category]) => {
  const ex: Exercise = {
    id,
    name,
    equipment,
    primary,
    secondary,
    category: category ?? 'strength',
  }
  const enrichment = CURATED_ENRICHMENTS[id]
  return enrichment ? { ...ex, instructions: enrichment.instructions, media: enrichment.media } : ex
})

/**
 * Exercise media is hotlinked (never bundled) from the public dataset repo.
 * Media (c) Gym visual - https://gymvisual.com/ (180x180, attribution required).
 */
export const DATASET_CDN = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/'
export const imgUrl = (media: string) => `${DATASET_CDN}images/${media}.jpg`
export const gifUrl = (media: string) => `${DATASET_CDN}videos/${media}.gif`

export function searchExercises(
  all: Exercise[],
  q: string,
  muscle: MuscleGroup | 'all',
  equipment: Equipment | 'all' = 'all'
): Exercise[] {
  const query = q.trim().toLowerCase()
  return all.filter((e) => {
    if (muscle !== 'all' && e.primary !== muscle && !e.secondary.includes(muscle)) return false
    if (equipment !== 'all' && e.equipment !== equipment) return false
    if (!query) return true
    return (
      e.name.toLowerCase().includes(query) ||
      e.equipment.toLowerCase().includes(query) ||
      e.primary.toLowerCase().includes(query)
    )
  })
}
