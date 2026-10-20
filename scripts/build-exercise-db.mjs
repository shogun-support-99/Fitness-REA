/**
 * Builds REA Fit's exercise database from hasaneyldrm/exercises-dataset.
 *
 * Usage:
 *   git clone --depth 1 https://github.com/hasaneyldrm/exercises-dataset.git /tmp/exds
 *   node scripts/build-exercise-db.mjs /tmp/exds/data/exercises.json
 *
 * Outputs:
 *   src/data/exercises-dataset.ts  — the ~1,300 new exercises (lazy-loaded chunk)
 *   src/data/curated-enrichments.ts — instructions + media for our curated exercises
 *
 * Dataset text data: MIT (https://github.com/hasaneyldrm/exercises-dataset)
 * Exercise media (images/GIFs): © Gym visual — https://gymvisual.com/ (hotlinked, not bundled)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = process.argv[2] ?? '/tmp/exds/data/exercises.json'
const records = JSON.parse(readFileSync(resolve(src), 'utf8'))

/* ---------- mappings ---------- */

const MUSCLE_MAP = {
  pectorals: 'Chest',
  lats: 'Back',
  'upper back': 'Back',
  spine: 'Back',
  'levator scapulae': 'Traps',
  traps: 'Traps',
  'serratus anterior': 'Chest',
  delts: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  adductors: 'Glutes',
  abductors: 'Glutes',
  abs: 'Core',
  calves: 'Calves',
  'cardiovascular system': 'Cardio',
}

const BODYPART_FALLBACK = {
  waist: 'Core',
  'upper legs': 'Quads',
  'lower legs': 'Calves',
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  'upper arms': 'Biceps',
  'lower arms': 'Forearms',
  neck: 'Traps',
  cardio: 'Cardio',
}

const EQUIP_MAP = {
  'body weight': 'Bodyweight',
  cable: 'Cable',
  rope: 'Cable',
  'leverage machine': 'Machine',
  'sled machine': 'Machine',
  'smith machine': 'Machine',
  assisted: 'Machine',
  'skierg machine': 'Machine',
  'stepmill machine': 'Machine',
  'stationary bike': 'Machine',
  'elliptical machine': 'Machine',
  'upper body ergometer': 'Machine',
  hammer: 'Machine',
  'medicine ball': 'Other',
  'stability ball': 'Other',
  'bosu ball': 'Other',
  roller: 'Other',
  'wheel roller': 'Other',
  tire: 'Other',
  'trap bar': 'Barbell',
  band: 'Band',
  'resistance band': 'Band',
  barbell: 'Barbell',
  'ez barbell': 'Barbell',
  'olympic barbell': 'Barbell',
  dumbbell: 'Dumbbell',
  kettlebell: 'Kettlebell',
  weighted: 'Other',
}

/** curated exercise id -> dataset name candidates (first found wins) */
const ALIASES = {
  'barbell-bench-press': ['barbell bench press'],
  'incline-barbell-bench-press': ['barbell incline bench press'],
  'back-squat': ['barbell full squat'],
  'front-squat': ['barbell front squat'],
  'deadlift': ['barbell deadlift'],
  'romanian-deadlift': ['barbell romanian deadlift'],
  'overhead-press': ['barbell standing wide military press'],
  'seated-dumbbell-shoulder-press': ['dumbbell seated shoulder press'],
  'arnold-press': ['dumbbell seated shoulder press (parallel grip)'],
  'barbell-row': ['barbell bent over row'],
  'dumbbell-row': ['dumbbell bent over row'],
  'lat-pulldown': ['cable lat pulldown full range of motion'],
  'seated-cable-row': ['cable seated row'],
  'pull-up': ['pull-up'],
  'chin-up': ['chin-up'],
  'push-up': ['push-up'],
  'ez-bar-curl': ['ez barbell curl'],
  'barbell-curl': ['barbell curl'],
  'dumbbell-curl': ['dumbbell curl', 'dumbbell alternate biceps curl'],
  'hammer-curl': ['dumbbell hammer curl'],
  'preacher-curl': ['dumbbell preacher curl'],
  'cable-curl': ['cable curl'],
  'concentration-curl': ['concentration curl', 'dumbbell concentration curl'],
  'lateral-raise': ['dumbbell lateral raise'],
  'cable-lateral-raise': ['cable lateral raise'],
  'front-raise': ['dumbbell front raise', 'band front raise'],
  'tricep-pushdown': ['cable pushdown'],
  'skull-crusher': ['barbell lying triceps extension'],
  'close-grip-bench-press': ['barbell close-grip bench press'],
  'leg-extension': ['lever leg extension'],
  'lying-leg-curl': ['lever lying leg curl'],
  'seated-leg-curl': ['lever seated leg curl'],
  'leg-press': ['sled 45° leg press', 'lever horizontal one leg press'],
  'standing-calf-raise': ['barbell standing calf raise'],
  'seated-calf-raise': ['barbell seated calf raise'],
  'goblet-squat': ['kettlebell goblet squat'],
  'barbell-glute-bridge': ['barbell glute bridge'],
  'hip-thrust': ['barbell hip thrust'],
  'hyperextension': ['hyperextension'],
  'chest-dip': ['chest dip'],
  'tricep-dip': ['triceps dip', 'triceps dip (on dip-pull-up cage)'],
  'kettlebell-swing': ['kettlebell swing'],
  burpee: ['burpee'],
  'hanging-leg-raise': ['hanging leg raise'],
  'hanging-knee-raise': ['hanging knee raise'],
  'russian-twist': ['russian twist'],
  'ab-wheel-rollout': ['ab wheel rollout'],
  'barbell-shrug': ['barbell shrug'],
  'dumbbell-shrug': ['dumbbell shrug'],
  'dumbbell-bench-press': ['dumbbell bench press'],
  'incline-dumbbell-press': ['incline dumbbell bench press'],
  'dumbbell-fly': ['dumbbell fly'],
  plank: ['plank', 'front plank'],
  'treadmill-run': ['treadmill'],
  'indoor-cycling': ['stationary bike'],
  'stair-climber': ['stepmill machine'],
  elliptical: ['elliptical machine'],
  'face-pull': ['face pull', 'cable face pull'],
  't-bar-row': ['t-bar row', 'barbell t-bar row'],
  'bulgarian-split-squat': ['dumbbell rear lunge', 'barbell rear lunge'],
  'smith-machine-bench-press': ['smith bench press'],
  'smith-machine-squat': ['smith squat'],
  'machine-chest-press': ['lever chest press', 'lever seated chest press'],
  'machine-shoulder-press': ['lever shoulder press', 'lever military press'],
  'pec-deck': ['lever seated fly', 'lever fly'],
  'cable-crossover': ['cable standing up straight crossovers', 'cable upper chest crossovers'],
  'cable-fly': ['cable standing fly', 'cable decline fly'],
  'upright-row': ['barbell upright row'],
  'reverse-curl': ['barbell reverse curl'],
  'wrist-curl': ['dumbbell wrist curl', 'band wrist curl'],
  'glute-bridge': ['low glute bridge on floor'],
  'step-up': ['dumbbell step up', 'barbell step up'],
  lunge: ['barbell lunge'],
  'walking-lunge': ['dumbbell lunge'],
  'nordic-curl': ['nordic curl'],
  'stiff-leg-deadlift': ['barbell stiff leg deadlift', 'dumbbell stiff leg deadlift'],
  'rack-pull': ['barbell rack pull'],
  'pendlay-row': ['barbell bent over row'],
  'turkish-get-up': ['kettlebell turkish get up'],
  thruster: ['barbell squat press', 'dumbbell squat press'],
  'mountain-climber': ['mountain climber'],
  'jump-rope': ['jump rope'],
  'crunch': ['crunch', 'bodyweight crunch'],
}

/* ---------- helpers ---------- */

const SMALL = new Set(['a', 'an', 'the', 'on', 'with', 'to', 'and', 'of', 'in', 'or', 'for', 'v.'])
const norm = (s) => s.toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim()

function titleCase(name) {
  const words = name.split(' ')
  const out = []
  words.forEach((w, i) => {
    let lower = w.toLowerCase()
    if (lower === 'ez') lower = 'EZ'
    if (/^(male|female)\)?$/.test(lower)) lower = lower[0].toUpperCase() + lower.slice(1)
    if (i > 0 && SMALL.has(lower)) {
      out.push(lower)
    } else {
      out.push(
        lower
          .split('-')
          .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
          .join('-')
      )
    }
  })
  return out.join(' ')
}

function mapMuscle(r) {
  if (r.category === 'cardio') return 'Cardio'
  if (MUSCLE_MAP[r.target]) return MUSCLE_MAP[r.target]
  if (BODYPART_FALLBACK[r.body_part]) return BODYPART_FALLBACK[r.body_part]
  return 'Full Body'
}

function mapSecondary(r, primary) {
  const list = []
  for (const m of r.secondary_muscles ?? []) {
    const mapped = MUSCLE_MAP[m] ?? BODYPART_FALLBACK[m]
    if (mapped && mapped !== primary && !list.includes(mapped)) list.push(mapped)
  }
  return list.slice(0, 3)
}

function steps(r) {
  const en = r.instruction_steps?.en
  if (Array.isArray(en) && en.length > 0) return en
  const text = r.instructions?.en
  if (typeof text === 'string' && text.trim()) {
    return text.split(/(?<=\.)\s+/).filter((s) => s.trim().length > 0)
  }
  return []
}

/** "images/0001-2gPfomN.jpg" -> "0001-2gPfomN" */
function mediaStem(r) {
  if (typeof r.image !== 'string') return ''
  const stem = r.image.replace(/^images\//, '').replace(/\.jpg$/, '')
  return /^[A-Za-z0-9-_]+$/.test(stem) ? stem : ''
}

/* ---------- build ---------- */

// index dataset by normalized name
const byName = new Map()
for (const r of records) {
  const key = norm(r.name)
  if (!byName.has(key)) byName.set(key, r)
}

// our curated list (must stay in sync with src/data/exercises.ts)
const CURATED = [
  'barbell-bench-press','incline-barbell-bench-press','decline-barbell-bench-press','dumbbell-bench-press',
  'incline-dumbbell-press','decline-dumbbell-press','dumbbell-fly','incline-dumbbell-fly','cable-fly','cable-crossover',
  'pec-deck','machine-chest-press','chest-dip','push-up','smith-machine-bench-press',
  'deadlift','barbell-row','pendlay-row','t-bar-row','dumbbell-row','seated-cable-row','lat-pulldown','pull-up','chin-up',
  'straight-arm-pulldown','rack-pull','face-pull','hyperextension',
  'barbell-shrug','dumbbell-shrug',
  'overhead-press','seated-dumbbell-shoulder-press','arnold-press','lateral-raise','cable-lateral-raise','front-raise',
  'rear-delt-fly','cable-rear-delt-fly','upright-row','machine-shoulder-press',
  'barbell-curl','ez-bar-curl','dumbbell-curl','hammer-curl','incline-dumbbell-curl','preacher-curl','cable-curl',
  'concentration-curl','spider-curl',
  'close-grip-bench-press','tricep-dip','tricep-pushdown','rope-pushdown','skull-crusher','overhead-tricep-extension',
  'cable-overhead-extension','dumbbell-kickback','bench-dip',
  'wrist-curl','reverse-wrist-curl','reverse-curl','farmers-walk',
  'back-squat','front-squat','goblet-squat','hack-squat','leg-press','leg-extension','bulgarian-split-squat','lunge',
  'walking-lunge','step-up','smith-machine-squat',
  'romanian-deadlift','stiff-leg-deadlift','lying-leg-curl','seated-leg-curl','nordic-curl',
  'hip-thrust','barbell-glute-bridge','cable-kickback','glute-bridge',
  'standing-calf-raise','seated-calf-raise','leg-press-calf-raise','single-leg-calf-raise',
  'hanging-leg-raise','hanging-knee-raise','ab-wheel-rollout','crunch','cable-crunch','russian-twist','dead-bug',
  'mountain-climber','plank','side-plank',
  'burpee','clean-and-jerk','snatch','kettlebell-swing','thruster','turkish-get-up',
  'treadmill-run','outdoor-run','indoor-cycling','rowing-machine','elliptical','jump-rope','stair-climber',
]
const curatedNames = new Map() // normalized curated name -> curated id
for (const c of CURATED) curatedNames.set(norm(c.replace(/-/g, ' ')), c)

// pass 1: enrich curated exercises (aliases + exact name matches)
const enrichments = {}
const used = new Set() // dataset records consumed
for (const [curatedId, candidates] of Object.entries(ALIASES)) {
  for (const cand of candidates) {
    const r = byName.get(norm(cand))
    if (r && !used.has(r.id)) {
      enrichments[curatedId] = { instructions: steps(r), media: mediaStem(r) }
      used.add(r.id)
      break
    }
  }
}
for (const [name, curatedId] of curatedNames) {
  if (enrichments[curatedId]) continue
  const r = byName.get(name)
  if (r && !used.has(r.id)) {
    enrichments[curatedId] = { instructions: steps(r), media: mediaStem(r) }
    used.add(r.id)
  }
}

// pass 2: everything else becomes a new exercise
const dataset = []
const seenNames = new Set([...curatedNames.keys()])
for (const r of records) {
  const key = norm(r.name)
  if (used.has(r.id) || seenNames.has(key)) continue
  seenNames.add(key)
  dataset.push({
    id: `db-${r.id}`,
    name: titleCase(r.name),
    equipment: EQUIP_MAP[r.equipment] ?? 'Other',
    primary: mapMuscle(r),
    secondary: mapSecondary(r, mapMuscle(r)),
    category: r.category === 'cardio' ? 'cardio' : 'strength',
    instructions: steps(r),
    media: mediaStem(r),
  })
}

/* ---------- write ---------- */

const header = `// AUTO-GENERATED by scripts/build-exercise-db.mjs — do not edit by hand.
// Source dataset: https://github.com/hasaneyldrm/exercises-dataset (text data: MIT)
// Exercise media (images/GIFs): © Gym visual — https://gymvisual.com/ (hotlinked via CDN)
import type { Exercise } from '../lib/types'
`

writeFileSync(
  resolve('src/data/exercises-dataset.ts'),
  `${header}
// ${dataset.length} additional exercises from the dataset (lazy-loaded at runtime).
export const DATASET_EXERCISES: Exercise[] = ${JSON.stringify(dataset, null, 1)}
`
)

writeFileSync(
  resolve('src/data/curated-enrichments.ts'),
  `${header}
// Instructions + media for the curated exercises, keyed by exercise id.
export const CURATED_ENRICHMENTS: Record<string, { instructions: string[]; media: string }> = ${JSON.stringify(enrichments, null, 1)}
`
)

const enrichedCount = Object.keys(enrichments).length
console.log(`curated exercises:        ${CURATED.length}`)
console.log(`curated enriched:         ${enrichedCount}`)
console.log(`new dataset exercises:    ${dataset.length}`)
console.log(`total in app:             ${CURATED.length + dataset.length}`)
const noSteps = dataset.filter((d) => d.instructions.length === 0).length
console.log(`new entries w/o steps:    ${noSteps}`)
const noMedia = dataset.filter((d) => !d.media).length
console.log(`new entries w/o media:    ${noMedia}`)
