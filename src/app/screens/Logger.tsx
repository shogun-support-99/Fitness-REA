import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Confirm, Sheet } from '../../components/ui'
import type { LoggedSet, PR, SetType, Workout } from '../../lib/types'
import {
  computePRs,
  fmtElapsed,
  fmtNum,
  fmtVolume,
  fmtWeight,
  lastPerformance,
  summarizePrev,
  toDisplayVal,
  toKg,
  workoutSetCount,
  workoutVolume,
} from '../../lib/utils'

const TYPE_ORDER: SetType[] = ['normal', 'warmup', 'drop', 'failure']
const TYPE_LETTER: Record<SetType, string> = {
  normal: '',
  warmup: 'W',
  drop: 'D',
  failure: 'F',
}

/** Numeric input that keeps a local draft while focused so typing feels natural. */
function NumField({
  value,
  onCommit,
  placeholder,
  suffix,
}: {
  value: number
  onCommit: (v: number) => void
  placeholder?: string
  suffix?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? (value > 0 ? fmtNum(value) : '')
  return (
    <div className="numfield">
      <input
        type="text"
        inputMode="decimal"
        value={shown}
        placeholder={placeholder ?? '0'}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => {
          setDraft(value > 0 ? fmtNum(value) : '')
          requestAnimationFrame(() => e.target.select())
        }}
        onBlur={() => {
          const v = parseFloat((draft ?? '').replace(',', '.'))
          onCommit(Number.isFinite(v) && v >= 0 ? v : 0)
          setDraft(null)
        }}
      />
      {suffix && <span className="numfield-suffix">{suffix}</span>}
    </div>
  )
}

export default function Logger() {
  const { state, dispatch, getExercise } = useStore()
  const ui = useUI()
  const active = state.active
  const unit = state.settings.unit
  const [, setTick] = useState(0)
  const [editing, setEditing] = useState<string | null>(null)
  const [notesOpen, setNotesOpen] = useState<string | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [summary, setSummary] = useState<{
    volume: number
    durationMin: number
    sets: number
    prs: PR[]
    name: string
  } | null>(null)

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const upd = (fn: (w: Workout) => void) => {
    if (!active) return
    const w: Workout = JSON.parse(JSON.stringify(active))
    fn(w)
    dispatch({ t: 'updateActive', workout: w })
  }

  const addExercises = (ids: string[]) => {
    upd((w) => {
      for (const id of ids) {
        w.exercises.push({
          exerciseId: id,
          notes: '',
          sets: [{ type: 'normal', weight: 0, reps: 0, duration: 0, distance: 0, done: false }],
        })
      }
    })
  }

  const addSet = (ei: number) =>
    upd((w) => {
      const ex = w.exercises[ei]
      const last = ex.sets[ex.sets.length - 1]
      ex.sets.push({
        type: 'normal',
        weight: last?.weight ?? 0,
        reps: last?.reps ?? 0,
        duration: last?.duration ?? 0,
        distance: last?.distance ?? 0,
        done: false,
      })
    })

  const patchSet = (ei: number, si: number, patch: Partial<LoggedSet>) =>
    upd((w) => {
      w.exercises[ei].sets[si] = { ...w.exercises[ei].sets[si], ...patch }
    })

  const removeSet = (ei: number, si: number) =>
    upd((w) => {
      w.exercises[ei].sets.splice(si, 1)
    })

  const removeExercise = (ei: number) =>
    upd((w) => {
      w.exercises.splice(ei, 1)
    })

  const toggleDone = (ei: number, si: number) => {
    if (!active) return
    const s = active.exercises[ei].sets[si]
    const nowDone = !s.done
    patchSet(ei, si, { done: nowDone })
    if (nowDone && state.settings.restAutoStart) {
      ui.startRest(state.settings.defaultRest)
    }
  }

  const cycleType = (ei: number, si: number) =>
    upd((w) => {
      const s = w.exercises[ei].sets[si]
      const next = TYPE_ORDER[(TYPE_ORDER.indexOf(s.type) + 1) % TYPE_ORDER.length]
      w.exercises[ei].sets[si].type = next
    })

  const finish = () => {
    if (!active) return
    const prs = computePRs(active, state.workouts)
    const snapshot = {
      volume: workoutVolume(active),
      durationMin: Math.max(1, Math.round((Date.now() - active.start) / 60000)),
      sets: workoutSetCount(active),
      prs,
      name: active.name,
    }
    dispatch({ t: 'finishActive' })
    setFinishing(false)
    setSummary(snapshot)
  }

  const anyLogged = useMemo(
    () => (active ? active.exercises.some((e) => e.sets.some((s) => s.done)) : false),
    [active]
  )

  if (!active && !summary) return null

  if (summary && !active) {
    return (
      <Sheet title="Workout complete" onClose={() => ui.resetTo('home')}>
        <div className="summary">
          <div className="summary-hero">
            <div className="summary-badge">
              <Icon name="check" size={30} strokeWidth={3} />
            </div>
            <h3>Great work{state.settings.name ? `, ${state.settings.name}` : ''}!</h3>
            <p className="muted">{summary.name}</p>
          </div>
          <div className="summary-grid">
            <div>
              <strong>{summary.durationMin}</strong>
              <span>minutes</span>
            </div>
            <div>
              <strong>{summary.sets}</strong>
              <span>sets</span>
            </div>
            <div>
              <strong>{fmtVolume(summary.volume, unit)}</strong>
              <span>volume ({unit})</span>
            </div>
          </div>
          {summary.prs.length > 0 && (
            <div className="summary-prs">
              <div className="prs-head">
                <Icon name="trophy" size={18} className="gold" />
                {summary.prs.length} personal record{summary.prs.length === 1 ? '' : 's'}
              </div>
              {summary.prs.map((p) => (
                <div key={p.exerciseId} className="pr-row">
                  <span className="pr-name">{getExercise(p.exerciseId)?.name}</span>
                  <span className="pr-detail">
                    {p.weight > 0 ? `${fmtWeight(p.weight, unit)} ${unit} × ${p.reps}` : `${p.reps} reps`}
                    {' · '}
                    est. 1RM {fmtWeight(p.e1rm, unit)} {unit}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-primary btn-lg" onClick={() => ui.resetTo('home')}>
            Done
          </button>
        </div>
      </Sheet>
    )
  }

  if (!active) return null
  const workout = active

  const exit = () => {
    if (anyLogged || workout.exercises.length > 0) setConfirmExit(true)
    else ui.resetTo('home')
  }

  return (
    <div className="logger">
      <header className="logger-head">
        <button className="icon-btn" onClick={exit} aria-label="Close workout">
          <Icon name="x" size={20} />
        </button>
        <input
          className="logger-name"
          value={workout.name}
          onChange={(e) => upd((w) => (w.name = e.target.value))}
          aria-label="Workout name"
        />
        <span className="logger-timer">
          <Icon name="clock" size={14} />
          {fmtElapsed(Date.now() - workout.start)}
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => setFinishing(true)}>
          Finish
        </button>
      </header>

      <div className="logger-body">
        {workout.exercises.map((ex, ei) => {
          const meta = getExercise(ex.exerciseId)
          const prev = lastPerformance(state.workouts, ex.exerciseId, workout.start)
          const isCardio = meta?.category === 'cardio'
          const isEditing = editing === ex.exerciseId + ei
          const showNotes = notesOpen === ex.exerciseId + ei || !!ex.notes
          return (
            <div className="card ex-card" key={ei}>
              <div className="ex-head">
                <div className="ex-title">
                  <h3>{meta?.name ?? 'Exercise'}</h3>
                  <span className="ex-sub">
                    {meta?.equipment}
                    {prev ? ` · Last: ${summarizePrev(prev, unit)}` : ''}
                  </span>
                </div>
                <div className="ex-actions">
                  <button
                    className={`icon-btn ${showNotes ? 'icon-btn-on' : ''}`}
                    onClick={() => setNotesOpen(notesOpen === ex.exerciseId + ei ? null : ex.exerciseId + ei)}
                    aria-label="Notes"
                  >
                    <Icon name="note" size={16} />
                  </button>
                  <button
                    className={`icon-btn ${isEditing ? 'icon-btn-on' : ''}`}
                    onClick={() => setEditing(isEditing ? null : ex.exerciseId + ei)}
                    aria-label="Edit sets"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    className="icon-btn icon-danger"
                    onClick={() => removeExercise(ei)}
                    aria-label="Remove exercise"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>

              {showNotes && (
                <textarea
                  className="ex-notes"
                  placeholder="Exercise notes…"
                  value={ex.notes}
                  onChange={(e) => upd((w) => (w.exercises[ei].notes = e.target.value))}
                />
              )}

              <div className={`set-grid ${isEditing ? 'set-grid-edit' : ''}`}>
                <div className="set-row set-row-head">
                  <span>{isEditing ? '' : 'SET'}</span>
                  {!isEditing && <span className="prev-col">PREV</span>}
                  {isCardio ? (
                    <>
                      <span>MIN</span>
                      <span>KM</span>
                    </>
                  ) : (
                    <>
                      <span>{unit.toUpperCase()}</span>
                      <span>REPS</span>
                    </>
                  )}
                  <span>{isEditing ? '' : '✓'}</span>
                </div>
                {ex.sets.map((s, si) => {
                  const letter = TYPE_LETTER[s.type]
                  return (
                    <div className="set-row" key={si}>
                      <button
                        className={`set-type ${letter ? `set-type-${s.type}` : ''}`}
                        onClick={() => cycleType(ei, si)}
                        title="Tap to change set type (normal / warmup / drop / failure)"
                      >
                        {letter || si + 1}
                      </button>
                      {!isEditing && (
                        <span className="prev-col">
                          {prev?.sets[si]
                            ? isCardio
                              ? prev.sets[si].duration > 0
                                ? `${fmtNum(prev.sets[si].duration)}m`
                                : '—'
                              : summarizeSet(prev.sets[si], unit)
                            : '—'}
                        </span>
                      )}
                      {isCardio ? (
                        <>
                          <NumField
                            value={s.duration}
                            onCommit={(v) => patchSet(ei, si, { duration: v })}
                          />
                          <NumField
                            value={s.distance}
                            onCommit={(v) => patchSet(ei, si, { distance: v })}
                          />
                        </>
                      ) : (
                        <>
                          <NumField
                            value={toDisplayVal(s.weight, unit)}
                            onCommit={(v) => patchSet(ei, si, { weight: toKg(v, unit) })}
                          />
                          <NumField value={s.reps} onCommit={(v) => patchSet(ei, si, { reps: Math.round(v) })} />
                        </>
                      )}
                      {isEditing ? (
                        <button
                          className="icon-btn icon-danger"
                          onClick={() => removeSet(ei, si)}
                          aria-label="Remove set"
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      ) : (
                        <button
                          className={`set-check ${s.done ? 'set-check-on' : ''}`}
                          onClick={() => toggleDone(ei, si)}
                          aria-label={s.done ? 'Uncheck set' : 'Complete set'}
                        >
                          <Icon name="check" size={15} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              <button className="add-set-btn" onClick={() => addSet(ei)}>
                <Icon name="plus" size={14} /> Add Set
              </button>
            </div>
          )
        })}

        <button
          className="btn btn-ghost btn-lg add-ex-btn"
          onClick={() =>
            ui.push({
              k: 'picker',
              onPick: (ids) => addExercises(ids),
            })
          }
        >
          <Icon name="plus" size={18} /> Add Exercise
        </button>

        <p className="logger-hint">
          Tap the set number to switch between normal (N), warm-up (W), drop (D) and failure (F)
          sets. Completing a set starts the rest timer.
        </p>
      </div>

      {confirmExit && (
        <Confirm
          title="Discard workout?"
          message="Your logged sets for this session will be lost."
          confirmLabel="Discard"
          danger
          onConfirm={() => {
            dispatch({ t: 'discardActive' })
            ui.resetTo('home')
          }}
          onCancel={() => setConfirmExit(false)}
        />
      )}

      {finishing && (
        <Sheet title="Finish workout?" onClose={() => setFinishing(false)}>
          <div className="finish-sheet">
            <div className="finish-stats">
              <div>
                <strong>{fmtElapsed(Date.now() - workout.start)}</strong>
                <span>duration</span>
              </div>
              <div>
                <strong>{workoutSetCount(workout)}</strong>
                <span>sets done</span>
              </div>
              <div>
                <strong>{fmtVolume(workoutVolume(workout), unit)}</strong>
                <span>volume ({unit})</span>
              </div>
            </div>
            {!anyLogged && (
              <p className="finish-warn">No sets are checked as complete yet.</p>
            )}
            <button className="btn btn-primary btn-lg" onClick={finish}>
              <Icon name="check" size={18} /> Finish workout
            </button>
            <button className="btn btn-ghost" onClick={() => setFinishing(false)}>
              Keep logging
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

function summarizeSet(s: LoggedSet, unit: 'kg' | 'lb'): string {
  if (s.weight > 0) return `${fmtWeight(s.weight, unit)}×${s.reps}`
  return `${s.reps}`
}

