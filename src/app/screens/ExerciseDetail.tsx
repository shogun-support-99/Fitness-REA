import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Confirm } from '../../components/ui'
import { LineChart } from '../../components/charts'
import { gifUrl } from '../../data/exercises'
import type { LoggedSet, Workout } from '../../lib/types'
import {
  bestSetE1RM,
  e1RM,
  fmtDate,
  fmtNum,
  fmtVolume,
  fmtWeight,
  setE1RM,
  workoutVolume,
} from '../../lib/utils'

export default function ExerciseDetail({ id }: { id: string }) {
  const { state, dispatch, getExercise } = useStore()
  const ui = useUI()
  const ex = getExercise(id)
  const unit = state.settings.unit
  const [confirmDelete, setConfirmDelete] = useState(false)

  const sessions = useMemo(() => {
    if (!ex) return []
    return state.workouts
      .filter((w) => w.exercises.some((e) => e.exerciseId === id))
      .sort((a, b) => a.start - b.start)
  }, [state.workouts, id, ex])

  if (!ex) return null

  let best: LoggedSet | null = null
  let bestE1RM = 0
  let totalVolume = 0
  for (const w of sessions) {
    for (const e of w.exercises) {
      if (e.exerciseId !== id) continue
      totalVolume += e.sets
        .filter((s) => s.done && s.type !== 'warmup')
        .reduce((sum, s) => sum + s.weight * s.reps, 0)
      for (const s of e.sets) {
        if (setE1RM(s) > bestE1RM) {
          bestE1RM = setE1RM(s)
          best = s
        }
      }
    }
  }

  const chartPoints = sessions.map((w) => {
    const e = w.exercises.find((x) => x.exerciseId === id)!
    return { label: fmtDate(w.start), value: Math.round(bestSetE1RM(e.sets) * 10) / 10 }
  })

  const addToActive = () => {
    if (!state.active) {
      dispatch({ t: 'startWorkout' })
    }
    const w = state.active ?? null
    dispatch({
      t: 'updateActive',
      workout: {
        ...(w ?? { id: 'new', name: 'Workout', start: Date.now(), end: 0 }),
        exercises: [
          ...(w?.exercises ?? []),
          { exerciseId: id, notes: '', sets: [{ type: 'normal', weight: 0, reps: 0, duration: 0, distance: 0, done: false }] },
        ],
      } as never,
    })
    ui.toast(`${ex.name} added to workout`)
    ui.resetTo('home')
    ui.push({ k: 'logger' })
  }

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="chevronLeft" size={22} />
        </button>
        <h2 className="truncate">{ex.name}</h2>
        {ex.custom && (
          <button className="icon-btn icon-danger" onClick={() => setConfirmDelete(true)} aria-label="Delete">
            <Icon name="trash" size={18} />
          </button>
        )}
      </header>

      <div className="ex-detail">
        {ex.media && (
          <figure className="ex-media">
            <img src={gifUrl(ex.media)} alt={`${ex.name} — exercise animation`} loading="lazy" />
            <figcaption>Exercise animation © Gym visual</figcaption>
          </figure>
        )}

        <div className="chip-row">
          <span className="chip chip-static">{ex.equipment}</span>
          <span className="chip chip-static">{ex.primary}</span>
          {ex.secondary.map((m) => (
            <span key={m} className="chip chip-dim">
              {m}
            </span>
          ))}
          {ex.custom && <span className="chip chip-accent">custom</span>}
        </div>

        {ex.instructions && ex.instructions.length > 0 && (
          <div className="card steps-card">
            <h3 className="card-title">How to do it</h3>
            <ol className="steps">
              {ex.instructions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {best ? (
          <div className="card pr-card">
            <div className="pr-icon">
              <Icon name="trophy" size={22} />
            </div>
            <div className="pr-main">
              <strong>
                {best.weight > 0
                  ? `${fmtWeight(best.weight, unit)} ${unit} × ${best.reps}`
                  : `${best.reps} reps`}
              </strong>
              <span>
                Personal record · est. 1RM {fmtWeight(bestE1RM, unit)} {unit} · e1RM{' '}
                {Math.round(e1RM(best.weight, best.reps)) > 0 ? '' : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="card quiet-card">
            <Icon name="info" size={18} />
            <span>No history yet — log this exercise to start tracking progress.</span>
          </div>
        )}

        <div className="stat-row stat-row-3">
          <div className="card stat-card">
            <strong>{sessions.length}</strong>
            <span>sessions</span>
          </div>
          <div className="card stat-card">
            <strong>{fmtVolume(totalVolume, unit)}</strong>
            <span>volume ({unit})</span>
          </div>
          <div className="card stat-card">
            <strong>{best ? fmtWeight(bestE1RM, unit) : '—'}</strong>
            <span>best 1RM</span>
          </div>
        </div>

        {chartPoints.length > 1 && (
          <div className="card chart-card">
            <h3 className="card-title">Estimated 1RM trend</h3>
            <LineChart points={chartPoints} format={(v) => `${fmtNum(v)} ${unit}`} />
          </div>
        )}

        {sessions.length > 0 && (
          <section className="section">
            <h3 className="section-title">History</h3>
            <div className="list">
              {[...sessions].reverse().map((w) => {
                const e = w.exercises.find((x) => x.exerciseId === id)!
                return (
                  <button key={w.id} className="card row-item" onClick={() => ui.push({ k: 'workout', id: w.id })}>
                    <div className="row-icon">
                      <Icon name="logbook" size={18} />
                    </div>
                    <div className="row-main">
                      <strong>{w.name}</strong>
                      <span>
                        {e.sets
                          .filter((s) => s.done)
                          .map((s) => (s.weight > 0 ? `${fmtWeight(s.weight, unit)}×${s.reps}` : `${s.reps}`))
                          .slice(0, 3)
                          .join(', ')}
                        {e.sets.length > 3 ? '…' : ''}
                      </span>
                    </div>
                    <div className="row-side">
                      <strong className="vol">{fmtVolume(workoutVolume(w), unit)}</strong>
                      <span className="muted">{fmtDate(w.start)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <button className="btn btn-primary btn-lg" onClick={addToActive}>
          <Icon name="plus" size={18} />
          {state.active ? 'Add to current workout' : 'Start workout with this'}
        </button>
      </div>

      {confirmDelete && (
        <Confirm
          title={`Delete ${ex.name}?`}
          message="It will be removed from your library. Past workouts keep their logs."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            dispatch({ t: 'deleteCustomExercise', id })
            ui.pop()
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
