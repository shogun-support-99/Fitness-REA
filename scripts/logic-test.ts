/** Logic tests: run with `npm run test:logic` */
import { EXERCISES, MUSCLE_GROUPS, searchExercises, EQUIPMENTS } from '../src/data/exercises'
import { DATASET_EXERCISES } from '../src/data/exercises-dataset'
import { CURATED_ENRICHMENTS } from '../src/data/curated-enrichments'
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
check('100+ curated exercises', EXERCISES.length >= 100)
check('unique curated ids', new Set(EXERCISES.map((e) => e.id)).size === EXERCISES.length)
check('search finds bench', searchExercises(EXERCISES, 'bench', 'all').some((e) => e.id === 'barbell-bench-press'))
check('muscle filter works', searchExercises(EXERCISES, '', 'Chest').every((e) => e.primary === 'Chest' || e.secondary.includes('Chest')))
check('cardio category exists', EXERCISES.filter((e) => e.category === 'cardio').length >= 8)

/* dataset */
const MUSCLES = new Set(MUSCLE_GROUPS.map((m) => m.id))
const EQUIPS = new Set(EQUIPMENTS)
check('1200+ dataset exercises', DATASET_EXERCISES.length >= 1200)
check('dataset ids unique', new Set(DATASET_EXERCISES.map((e) => e.id)).size === DATASET_EXERCISES.length)
check('dataset muscle groups valid', DATASET_EXERCISES.every((e) => MUSCLES.has(e.primary)))
check('dataset equipment valid', DATASET_EXERCISES.every((e) => EQUIPS.has(e.equipment)))
check('dataset mostly has instructions', DATASET_EXERCISES.filter((e) => (e.instructions ?? []).length > 0).length >= DATASET_EXERCISES.length * 0.95)
check('dataset media stems well-formed', DATASET_EXERCISES.every((e) => !e.media || /^[A-Za-z0-9-_]+$/.test(e.media)))
check('no name collisions curated vs dataset', !DATASET_EXERCISES.some((d) => EXERCISES.some((c) => c.name.toLowerCase() === d.name.toLowerCase())))
const squat = EXERCISES.find((e) => e.id === 'back-squat')!
check('curated back-squat enriched (media + instructions)', !!squat.media && (squat.instructions ?? []).length >= 3)
check('enrichment keys are curated ids', Object.keys(CURATED_ENRICHMENTS).every((k) => EXERCISES.some((e) => e.id === k)))
check('dataset search across merged list', searchExercises([...EXERCISES, ...DATASET_EXERCISES], 'squat', 'all', 'Barbell').length > 20)

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
/* body distribution: real sets -> per-muscle counts */
import { levelFor, muscleSets, setsLabel, totalSets } from '../src/lib/bodymap'
const mk = (primary: string, secondary: string[], sets: number, at: number, done = true) => ({
  id: 'w-bm-' + primary + sets + at,
  name: 'T',
  start: at,
  end: at + 3600000,
  exercises: [
    {
      exerciseId: 'x-' + primary,
      note: '',
      sets: Array.from({ length: sets }, (_, i) => ({
        weight: 60,
        reps: 5,
        duration: 0,
        distance: 0,
        type: 'normal' as const,
        done: done && i < sets,
      })),
    },
  ],
})
const EXERCISES_BY_ID: Record<string, any> = {
  'x-Chest': { name: 'Bench', equipment: 'Barbell', primary: 'Chest', secondary: ['Triceps'], category: 'strength' },
  'x-Quads': { name: 'Squat', equipment: 'Barbell', primary: 'Quads', secondary: ['Glutes', 'Hamstrings'], category: 'strength' },
  'x-Full Body': { name: 'Burpee', equipment: 'Bodyweight', primary: 'Full Body', secondary: [], category: 'strength' },
  'x-Cardio': { name: 'Run', equipment: 'None', primary: 'Cardio', secondary: [], category: 'cardio' },
}
const resolve = (id: string) => EXERCISES_BY_ID[id]
const DAY0 = 1779500000000 // fixed Monday-ish timestamp
const bmWorkouts = [
  mk('Chest', ['Triceps'], 4, DAY0),          // chest +8, triceps +4 (half)
  mk('Quads', ['Glutes', 'Hamstrings'], 3, DAY0 + 3600000), // quads +6, glutes/ham +3
  mk('Chest', ['Triceps'], 2, DAY0 + 2 * 86400000),         // next day
  mk('Full Body', [], 2, DAY0 + 86400000),    // half-set x8 groups
]
const daySets = muscleSets(bmWorkouts, DAY0, DAY0 + 86400000, resolve)
check('primary counts full sets', daySets.chest === 8)
check('secondary counts half sets', daySets.triceps === 4)
check('quads/glutes split primary/secondary', daySets.quads === 6 && daySets.glutes === 3 && daySets.hamstrings === 3)
check('full body spreads half sets', muscleSets(bmWorkouts, DAY0 + 86400000, DAY0 + 2 * 86400000, resolve).chest === 2)
check('cardio adds no muscle sets', muscleSets([mk('Cardio', [], 5, DAY0)], DAY0, DAY0 + 86400000, resolve).chest === 0)
check('day window excludes other days', daySets.chest === 8)
/* week totals: day0 (chest 8, triceps 4, quads 6, glutes 3, hams 3)
   + day1 full-body (+2 each major) + day2 (chest 4, triceps 2) */
const weekSets = muscleSets(bmWorkouts, DAY0, DAY0 + 7 * 86400000, resolve)
check('week window sums all days', weekSets.chest === 14 && weekSets.quads === 8 && weekSets.triceps === 8)
check('total sets sums muscles', totalSets(weekSets) === 46)
check('sets label formats halves', setsLabel(12) === '6' && setsLabel(9) === '4.5')
check('levels bucket 0/1-4/5-9/10+', levelFor(0) === 0 && levelFor(2) === 1 && levelFor(10) === 2 && levelFor(18) === 2 && levelFor(20) === 3)
check('only done sets count', muscleSets([mk('Chest', [], 3, DAY0, false)], DAY0, DAY0 + 86400000, resolve).chest === 0)

/* seed through importData (the JSON-import path real users have) */
s = reducer(s, { t: 'importData', state: { ...s, workouts: sampleWorkouts(), routines: sampleRoutines() } })
check('import seeds workouts + routines', s.workouts.length === 8 && s.routines.length === 4)

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

/* social layer: likes, comments, contacts, share codes */
const post0 = s.posts[0]
s = reducer(s, { t: 'likePost', id: post0.id })
check('likePost adds like', s.posts[0].likedByMe === true && s.posts[0].likes === post0.likes + 1)
s = reducer(s, { t: 'likePost', id: post0.id })
check('likePost toggles off', s.posts[0].likedByMe === false && s.posts[0].likes === post0.likes)
s = reducer(s, { t: 'commentPost', id: post0.id, text: 'strong session' })
check('commentPost appends', s.posts[0].comments.length === post0.comments.length + 1)

s = reducer(s, { t: 'addContact', name: 'Test Friend', handle: 'test.friend' })
check('addContact adds', s.contacts.some((c) => c.handle === 'test.friend'))
const contactId = s.contacts.find((c) => c.handle === 'test.friend')!.id
check('new contact auto-follows', s.contacts.find((c) => c.id === contactId)!.followed === true)
s = reducer(s, { t: 'toggleContactFollow', id: contactId })
check('contact follow toggles', s.contacts.find((c) => c.id === contactId)!.followed === false)

const shareW = s.workouts[0]
s = reducer(s, { t: 'shareWorkout', workoutId: shareW.id })
check('shareWorkout posts once', s.posts.filter((p) => p.workoutId === shareW.id).length === 1)
s = reducer(s, { t: 'shareWorkout', workoutId: shareW.id })
check('shareWorkout dedupes', s.posts.filter((p) => p.workoutId === shareW.id).length === 1)
const sharedPost = s.posts.find((p) => p.workoutId === shareW.id)!
check('shared post is mine', sharedPost.author.kind === 'me' && sharedPost.author.handle === 'you')
check('shared post snapshots sets', sharedPost.workout.exercises.length === shareW.exercises.length)

/* share codes round-trip */
import { encodeShared, decodeShared, codeToPost } from '../src/lib/share'
const code = encodeShared(sharedPost.author, sharedPost.workout, sharedPost.createdAt)
const decoded = decodeShared(code)
check('share code round-trips', decoded !== null && decoded.workout.name === sharedPost.workout.name)
/* importing a link to a post you already have must not duplicate it */
const beforeSelfImport = s.posts.length
s = reducer(s, { t: 'importSharedPost', code })
check('import of own post dedupes', s.posts.length === beforeSelfImport)
/* a foreign share imports once, then dedupes on repeat */
const friendCode = encodeShared(
  { name: 'Riya Patel', handle: 'riya.lifts', color: '#a855f7' },
  { name: 'Pull Day', startedAt: Date.now() - 3600000, durationMin: 55, volumeKg: 7200, exercises: [{ name: 'Deadlift', sets: [{ weight: 140, reps: 3 }] }] },
  Date.now() - 3600000
)
const importCount0 = s.posts.length
s = reducer(s, { t: 'importSharedPost', code: friendCode })
check('import adds post', s.posts.length === importCount0 + 1)
check('import creates followed contact', s.contacts.some((c) => c.handle === 'riya.lifts' && c.followed === true))
s = reducer(s, { t: 'importSharedPost', code: friendCode })
check('repeat import dedupes', s.posts.length === importCount0 + 1)
const bad = codeToPost('garbage!!')
check('bad share code rejected', bad === null)

/* regression: the library used to load through a dispatch the reducer ignored,
   leaving the app with only the 109 curated exercises. It now ships in the
   initial state itself — there is no async path left to fail. */
let ds = freshState()
check('fresh state carries the full library', ds.dataset.length === DATASET_EXERCISES.length)
check('merged library is 1300+ exercises', ds.dataset.length + EXERCISES.length >= 1300)
ds = reducer(ds, { t: 'clearAll' })
check('clearAll keeps the library', ds.dataset.length === DATASET_EXERCISES.length)

const cleared = reducer(s, { t: 'clearAll' })
check('clearAll resets', cleared.workouts.length === 0 && cleared.active === null && cleared.customs.length === 0)

if (failures > 0) {
  console.error(`\n${failures} FAILURES`)
  process.exit(1)
}
console.log('\nALL LOGIC TESTS PASSED')
