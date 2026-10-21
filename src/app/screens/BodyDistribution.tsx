import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Segmented, Sheet } from '../../components/ui'
import { weekStart } from '../../lib/utils'
import {
  LEVEL_LABELS,
  MUSCLES,
  levelFor,
  muscleSets,
  setsLabel,
  totalSets,
  type MuscleId,
  type MuscleSets,
} from '../../lib/bodymap'

const DAY_MS = 86400000
const WEEK_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const dayStart = (ts: number) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** "18–24 October" / "28 October – 3 November" */
function rangeLabel(from: number, to: number) {
  const a = new Date(from)
  const b = new Date(to - 1)
  const ma = MONTHS[a.getMonth()]
  const mb = MONTHS[b.getMonth()]
  if (ma === mb) return `${a.getDate()}–${b.getDate()} ${ma}`
  return `${a.getDate()} ${ma} – ${b.getDate()} ${mb}`
}

type Mode = 'week' | 'day'

export default function BodyDistribution() {
  const { state, getExercise } = useStore()
  const ui = useUI()
  const { workouts, settings } = state

  const [weekOffset, setWeekOffset] = useState(0)
  const [mode, setMode] = useState<Mode>('week')
  const [selectedDay, setSelectedDay] = useState<number>(() => dayStart(Date.now()))
  const [helpOpen, setHelpOpen] = useState(false)

  const weekFrom = weekStart(Date.now()) + weekOffset * 7 * DAY_MS
  const weekTo = weekFrom + 7 * DAY_MS
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dayStart(weekFrom) + i * DAY_MS),
    [weekFrom]
  )
  const today = dayStart(Date.now())
  const workoutDays = useMemo(
    () => new Set(workouts.map((w) => dayStart(w.start))),
    [workouts]
  )

  // the selected day must live inside the visible week
  const activeDay = days.includes(selectedDay) ? selectedDay : days[6]

  const from = mode === 'week' ? weekFrom : activeDay
  const to = mode === 'week' ? weekTo : activeDay + DAY_MS

  const sets = useMemo(
    () => muscleSets(workouts, from, to, getExercise),
    [workouts, from, to, getExercise]
  )
  const total = totalSets(sets)
  const trained = MUSCLES.filter((m) => sets[m.id] > 0)

  const shiftWeek = (dir: -1 | 1) => {
    setWeekOffset((w) => w + dir)
    if (mode === 'day') {
      // carry the weekday into the neighbouring week
      setSelectedDay((d) => d + dir * 7 * DAY_MS)
    }
  }

  const pickDay = (d: number) => {
    setSelectedDay(d)
    setMode('day')
  }

  const share = () => {
    const lines = [
      `REA Fit — Body distribution`,
      mode === 'week' ? `${rangeLabel(weekFrom, weekTo)} · week` : `${rangeLabel(activeDay, activeDay + DAY_MS)} · day`,
      `Total ${setsLabel(total)} sets`,
    ]
    if (trained.length > 0) {
      lines.push(
        [...trained]
          .sort((a, b) => sets[b.id] - sets[a.id])
          .map((m) => `${m.label} ${setsLabel(sets[m.id])}`)
          .join(' · ')
      )
    } else {
      lines.push('No sets logged yet.')
    }
    const text = lines.join('\n')
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => ui.toast('Summary copied'),
        () => ui.toast('Could not copy')
      )
    } else {
      ui.toast('Could not copy')
    }
  }

  return (
    <div className="subscreen bodydist">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="chevronLeft" size={22} />
        </button>
        <h2>Body distribution</h2>
        <div className="head-actions">
          <button className="icon-btn" onClick={() => setHelpOpen(true)} aria-label="How this works">
            <Icon name="help" size={20} />
          </button>
          <button className="icon-btn" onClick={share} aria-label="Share summary">
            <Icon name="upload" size={20} />
          </button>
        </div>
      </header>

      <div className="bd-body">
        <div className="card bd-weekcard">
          <div className="bd-range">
            <button
              className="icon-btn"
              onClick={() => shiftWeek(-1)}
              aria-label="Previous week"
            >
              <Icon name="chevronLeft" size={18} />
            </button>
            <strong>{rangeLabel(weekFrom, weekTo)}</strong>
            <button
              className="icon-btn"
              onClick={() => shiftWeek(1)}
              disabled={weekOffset >= 0}
              aria-label="Next week"
            >
              <Icon name="chevronRight" size={18} />
            </button>
          </div>

          <div className="bd-pills" role="tablist" aria-label="Days of the week">
            {days.map((d, i) => {
              const isActive = mode === 'day' && d === activeDay
              const isToday = d === today
              const hasWorkout = workoutDays.has(d)
              return (
                <button
                  key={d}
                  className={`bd-pill ${isActive ? 'bd-pill-active' : ''} ${
                    d > today ? 'bd-pill-future' : ''
                  }`}
                  onClick={() => pickDay(d)}
                  aria-pressed={isActive}
                >
                  <span className="bd-pill-letter">{WEEK_LETTERS[i]}</span>
                  <strong className={isToday && !isActive ? 'bd-pill-today' : ''}>
                    {new Date(d).getDate()}
                  </strong>
                  <i
                    className={`bd-pill-dot ${hasWorkout ? 'bd-pill-dot-on' : ''} ${
                      isToday && !hasWorkout ? 'bd-pill-dot-today' : ''
                    }`}
                  />
                </button>
              )
            })}
          </div>

          <div className="bd-mode">
            <Segmented
              options={[
                { value: 'week', label: 'Week' },
                { value: 'day', label: 'Day' },
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>
        </div>

        <div className="card bd-figurecard">
          <div className="bd-figures">
            <BodyFigure view="front" sets={sets} />
            <BodyFigure view="back" sets={sets} />
          </div>
          <div className="bd-legend">
            {LEVEL_LABELS.map((label, i) => (
              <span key={label} className="bd-legend-chip">
                <i className={`bd-swatch bd-l${i}`} />
                {label}
              </span>
            ))}
          </div>
          {total === 0 && (
            <p className="bd-empty">
              No sets logged {mode === 'week' ? 'this week' : 'on this day'}. Pick another day,
              browse weeks, or log a workout — the map fills in as you train.
            </p>
          )}
        </div>

        <div className="card bd-table">
          <div className="bd-row bd-row-total">
            <span>Total</span>
            <strong>{setsLabel(total)}</strong>
          </div>
          {MUSCLES.map((m) => (
            <div key={m.id} className={`bd-row ${sets[m.id] === 0 ? 'bd-row-zero' : ''}`}>
              <span>{m.label}</span>
              <span className="bd-row-sets">
                {sets[m.id] === 0 ? '—' : setsLabel(sets[m.id])}
              </span>
            </div>
          ))}
          <p className="muted small bd-note">
            Primary muscles count every completed set; secondary muscles count half. {settings.unit === 'kg' ? 'kg' : 'lb'} units
            don’t affect set counts.
          </p>
        </div>
      </div>

      {helpOpen && (
        <Sheet title="How body distribution works" onClose={() => setHelpOpen(false)}>
          <div className="bd-help">
            <p>
              The map shows how many sets you logged per muscle group for the selected{' '}
              <strong>week</strong>, or for a single <strong>day</strong> when you tap a date pill.
            </p>
            <div className="bd-help-scale">
              {LEVEL_LABELS.map((label, i) => (
                <span key={label} className="bd-legend-chip">
                  <i className={`bd-swatch bd-l${i}`} />
                  {label} sets
                </span>
              ))}
            </div>
            <p>
              <strong>Counting rules</strong>
            </p>
            <ul>
              <li>Only completed (checked) sets count.</li>
              <li>A set counts fully toward the exercise’s primary muscle.</li>
              <li>Secondary muscles get half a set each.</li>
              <li>Full-body exercises spread half a set across the major groups; cardio adds none.</li>
            </ul>
            <p>
              Everything is computed from <strong>your</strong> workout history on this device —
              nothing is estimated or imported.
            </p>
          </div>
        </Sheet>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Stylized anatomical figures — hand-drawn SVG paths, grouped per     */
/* muscle so the heatmap can color them by set count.                  */
/* ------------------------------------------------------------------ */

type Shape = { x: number; y: number; w: number; h: number; r: number }

const sh = (x: number, y: number, w: number, h: number, r: number): Shape => ({ x, y, w, h, r })

/** neutral silhouette parts shared by both views */
const NEUTRAL_FRONT: Shape[] = [
  sh(54, 32, 12, 9, 3), // neck
  sh(47, 103, 26, 8, 4), // pelvis
  sh(46, 149, 10, 26, 5), // left shin
  sh(64, 149, 10, 26, 5), // right shin
  sh(46, 177, 10, 7, 3), // left foot
  sh(64, 177, 10, 7, 3), // right foot
]
const NEUTRAL_BACK: Shape[] = [
  sh(54, 32, 12, 9, 3), // neck
  sh(46, 177, 10, 7, 3), // left foot
  sh(64, 177, 10, 7, 3), // right foot
]

/** muscle regions per view; each entry becomes a colored path */
const FRONT_MUSCLES: Partial<Record<MuscleId, Shape[]>> = {
  shoulders: [sh(34, 44, 15, 14, 7), sh(71, 44, 15, 14, 7)],
  chest: [sh(46, 59, 13, 16, 4), sh(61, 59, 13, 16, 4)],
  core: [sh(48, 77, 24, 25, 6)],
  biceps: [sh(32, 61, 11, 20, 5), sh(77, 61, 11, 20, 5)],
  forearms: [sh(30, 83, 10, 22, 5), sh(80, 83, 10, 22, 5)],
  quads: [sh(44, 113, 13, 34, 6), sh(63, 113, 13, 34, 6)],
}
const BACK_MUSCLES: Partial<Record<MuscleId, Shape[]>> = {
  traps: [sh(51, 42, 18, 13, 6)],
  shoulders: [sh(34, 44, 15, 14, 7), sh(71, 44, 15, 14, 7)],
  back: [sh(45, 59, 13, 21, 5), sh(62, 59, 13, 21, 5), sh(53, 81, 14, 15, 4)],
  triceps: [sh(32, 61, 11, 20, 5), sh(77, 61, 11, 20, 5)],
  forearms: [sh(30, 83, 10, 22, 5), sh(80, 83, 10, 22, 5)],
  glutes: [sh(46, 98, 12, 13, 5), sh(62, 98, 12, 13, 5)],
  hamstrings: [sh(44, 113, 13, 32, 6), sh(63, 113, 13, 32, 6)],
  calves: [sh(45, 147, 11, 26, 5), sh(64, 147, 11, 26, 5)],
}

function Shapes({ shapes, className }: { shapes: Shape[]; className?: string }) {
  return (
    <>
      {shapes.map((s, i) => (
        <rect
          key={i}
          className={className}
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={s.r}
        />
      ))}
    </>
  )
}

function BodyFigure({ view, sets }: { view: 'front' | 'back'; sets: MuscleSets }) {
  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES
  const neutral = view === 'front' ? NEUTRAL_FRONT : NEUTRAL_BACK
  return (
    <figure className={`bd-figure bd-${view}`}>
      <svg viewBox="0 0 120 190" role="img" aria-label={`${view} body view`}>
        {/* head + hands stay neutral */}
        <circle className="bd-neutral" cx={60} cy={20} r={13} />
        <circle className="bd-neutral" cx={35} cy={110} r={4} />
        <circle className="bd-neutral" cx={85} cy={110} r={4} />
        <Shapes shapes={neutral} className="bd-neutral" />
        {(Object.keys(muscles) as MuscleId[]).map((id) => {
          const level = levelFor(sets[id])
          const label = MUSCLES.find((m) => m.id === id)!.label
          return (
            <g key={id} className={`bd-l${level} bd-muscle`}>
              <title>{`${label} — ${setsLabel(sets[id])} sets`}</title>
              <Shapes shapes={muscles[id]!} />
            </g>
          )
        })}
      </svg>
      <figcaption>{view === 'front' ? 'Front' : 'Back'}</figcaption>
    </figure>
  )
}
