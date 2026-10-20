/** Logic tests: run with `npm run test:logic` */
import { EXERCISES, searchExercises } from '../src/data/exercises'
import { sampleRoutines, sampleWorkouts } from '../src/lib/seed'
import { reducer, freshState } from '../src/lib/store'
import type { AppState } from '../src/lib/types'
import {
  computePRs,
  e1RM,
  fmtElapsed,
  fmtWeight,
  workoutStreak,
  workoutVolume,
} from '../src/lib/utils'

let failures = 0
function check(name: string, cond: boolean) {
  if (cond) console.log(`OK  ${name}`)
  else {
    failures++
    console.error(`FAIL ${name}`)
  }
}

/* pure math */
check('e1RM epley 100x5 ≈ 116.67', Math.abs(e1RM(100, 5) - 116.666) < 0.01)
check('e1RM 1 rep = weight', e1RM(120, 1) === 120)
check('fmtWeight kg', fmtWeight(62.5, 'kg') === '62.5')
check('fmtWeight lb converts', fmtWeight(100, 'lb') === '220.5')
check('fmtElapsed', fmtElapsed(754000) === '12:34')

/* exercise db */
check('100+ exercises', EXERCISES.length >= 100)
check('unique ids', new Set(EXERCISES.map((e) => e.id)).size === EXERCISES.length)
check('search finds bench', searchExercises(EXERCISES, 'bench', 'all').some((e) => e.id === 'barbell-bench-press'))
check('muscle filter works', searchExercises(EXERCISES, '', 'Chest').every((e) => e.primary === 'Chest' || e.secondary.includes('Chest')))
check('cardio category exists', EXERCISES.filter((e) => e.category === 'cardio').length >= 8)

/* seed data integrity */
const sw = sampleWorkouts()
check('8 sample workouts', sw.length === 8)
const exIds = new Set(EXERCISES.map((e) => e.id))
check('sample workout exercise ids valid', sw.every((w) => w.exercises.every((e) => exIds.has(e.exerciseId))))
check('sample workouts ordered newest first', sw[0].start > sw[sw.length - 1].start)
check('sample routines valid', sampleRoutines().every((r) => r.exercises.every((e) => exIds.has(e.exerciseId))))

/* PRs & volume */
const prior = sw.slice(1) // all but newest
const prs = computePRs(sw[0], prior)
const prIds = prs.map((p) => p.exerciseId)
check('PR detected for first-time exercise', prIds.includes('kettlebell-swing'))
check('no false PR when lift was lighter (80x5 vs prior 82.5x8)', !prIds.includes('back-squat'))
check('no bogus PRs (only improvements)', prs.every((p) => p.e1rm > p.prevBest))
check('volume excludes warmup', workoutVolume(sw[5]) > 0)

/* streak */
const day = 86400000
const mkW = (daysAgo: number): AppState['workouts'][number] => ({
  id: `t${daysAgo}`,
  name: 'T',
  start: Date.now() - daysAgo * day,
  end: Date.now() - daysAgo * day + 3600000,
  exercises: [],
})
check('streak counts consecutive days', workoutStreak([mkW(0), mkW(1), mkW(2)]) === 3)
check('streak skips gap (not 4)', workoutStreak([mkW(0), mkW(1), mkW(2), mkW(4)]) === 3)
check('streak alive if only yesterday', workoutStreak([mkW(1), mkW(2)]) === 2)

/* reducer flows */
let s = freshState()
s = reducer(s, { t: 'loadSample' })
check('loadSample seeds data', s.workouts.length === 8 && s.routines.length === 4)
check('loadSample is idempotent', reducer(s, { t: 'loadSample' }).workouts.length === 8)

const routine = s.routines.find((r) => r.name === 'Push Day')!
s = reducer(s, { t: 'startWorkout', routineId: routine.id })
check('startWorkout copies routine', s.active!.exercises.length === routine.exercises.length)
check('startWorkout sets sets undone', s.active!.exercises.every((e) => e.sets.every((x) => !x.done)))
check('startWorkout names after routine', s.active!.name === 'Push Day')

s = reducer(s, {
  t: 'updateActive',
  workout: { ...s.active!, exercises: [...s.active!.exercises, { exerciseId: 'push-up', notes: '', sets: [{ type: 'normal', weight: 0, reps: 15, duration: 0, distance: 0, done: true }] }] },
})
const before = s.workouts.length
s = reducer(s, { t: 'finishActive' })
check('finishActive stores workout', s.workouts.length === before + 1 && s.active === null)
check('finished workout is newest', s.workouts[0].name === 'Push Day' && s.workouts[0].end > 0)

s = reducer(s, { t: 'startAgain', workoutId: s.workouts[0].id })
check('startAgain recreates with values', s.active!.exercises.some((e) => e.exerciseId === 'push-up'))

s = reducer(s, { t: 'discardActive' })
check('discard clears active', s.active === null)

s = reducer(s, { t: 'settings', patch: { unit: 'lb' } })
check('settings patch', s.settings.unit === 'lb')

const customId = 'custom-xyz'
s = reducer(s, { t: 'addCustomExercise', exercise: { id: customId, name: 'My Move', equipment: 'Barbell', primary: 'Chest', secondary: [], category: 'strength', custom: true } })
check('custom exercise added', s.customs.length === 1 && s.customs[0].id === customId)

s = reducer(s, { t: 'toggleLike', id: 'p1' })
s = reducer(s, { t: 'toggleLike', id: 'p1' })
check('toggleLike toggles', s.liked.length === 0)
s = reducer(s, { t: 'toggleLike', id: 'p1' })
check('toggleLike adds', s.liked.includes('p1'))

const cleared = reducer(s, { t: 'clearAll' })
check('clearAll resets', cleared.workouts.length === 0 && cleared.active === null && cleared.customs.length === 0)

if (failures > 0) {
  console.error(`\n${failures} FAILURES`)
  process.exit(1)
}
console.log('\nALL LOGIC TESTS PASSED')
