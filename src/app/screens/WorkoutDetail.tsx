import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Confirm } from '../../components/ui'
import { computePRs, fmtDateLong, fmtDuration, fmtVolume, fmtWeight, toDisplayVal, workoutVolume } from '../../lib/utils'
import { uid } from '../../lib/utils'

export default function WorkoutDetail({ id }: { id: string }) {
  const { state, dispatch, getExercise } = useStore()
  const ui = useUI()
  const unit = state.settings.unit
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [savedRoutine, setSavedRoutine] = useState(false)

  const workout = state.workouts.find((w) => w.id === id)

  const prs = useMemo(() => {
    if (!workout) return []
    const prior = state.workouts.filter((w) => w.start < workout.start)
    return computePRs(workout, prior)
  }, [workout, state.workouts])

  if (!workout) return null

  const saveAsRoutine = () => {
    dispatch({
      t: 'saveRoutine',
      routine: {
        id: uid(),
        name: `${workout.name} routine`,
        createdAt: Date.now(),
        exercises: workout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          notes: e.notes,
          sets: e.sets.map((s) => ({
            type: s.type,
            weight: s.weight,
            reps: s.reps,
            duration: s.duration,
            distance: s.distance,
          })),
        })),
      },
    })
    setSavedRoutine(true)
    ui.toast('Saved as routine')
  }

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="chevronLeft" size={22} />
        </button>
        <h2 className="truncate">{workout.name}</h2>
        <button className="icon-btn icon-danger" onClick={() => setConfirmDelete(true)} aria-label="Delete workout">
          <Icon name="trash" size={18} />
        </button>
      </header>

      <div className="wdetail">
        <p className="muted wd-date">{fmtDateLong(workout.start)}</p>

        <div className="stat-row stat-row-4">
          <div className="card stat-card">
            <strong>{fmtDuration(workout.end - workout.start)}</strong>
            <span>duration</span>
          </div>
          <div className="card stat-card">
            <strong>{fmtVolume(workoutVolume(workout), unit)}</strong>
            <span>volume</span>
          </div>
          <div className="card stat-card">
            <strong>{workout.exercises.length}</strong>
            <span>exercises</span>
          </div>
          <div className="card stat-card">
            <strong>
              {workout.exercises.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0)}
            </strong>
            <span>sets</span>
          </div>
        </div>

        {prs.length > 0 && (
          <div className="card pr-banner">
            <div className="pr-icon">
              <Icon name="trophy" size={20} />
            </div>
            <div>
              <strong>
                {prs.length} personal record{prs.length === 1 ? '' : 's'} set
              </strong>
              <span>
                {prs
                  .map((p) => getExercise(p.exerciseId)?.name)
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          </div>
        )}

        {workout.exercises.map((ex, i) => {
          const meta = getExercise(ex.exerciseId)
          const isCardio = meta?.category === 'cardio'
          return (
            <div className="card ex-card" key={i}>
              <div className="ex-title">
                <h3>{meta?.name ?? 'Exercise'}</h3>
                <span className="ex-sub">{meta?.equipment}</span>
              </div>
              {ex.notes && <p className="wd-notes">“{ex.notes}”</p>}
              <div className="set-grid set-grid-readonly">
                <div className="set-row set-row-head">
                  <span>SET</span>
                  <span className="prev-col">{isCardio ? 'RESULT' : 'RESULT'}</span>
                  <span />
                  <span />
                  <span>✓</span>
                </div>
                {ex.sets.map((s, si) => {
                  const letter = s.type !== 'normal' ? (s.type === 'warmup' ? 'W' : s.type === 'drop' ? 'D' : 'F') : ''
                  const result = isCardio
                    ? `${s.duration > 0 ? `${s.duration} min` : ''}${s.distance > 0 ? `${s.duration > 0 ? ' · ' : ''}${s.distance} km` : ''}`
                    : s.weight > 0
                      ? `${fmtWeight(s.weight, unit)} ${unit} × ${s.reps}`
                      : `${s.reps} reps`
                  return (
                    <div className="set-row" key={si}>
                      <span className={`set-type ${letter ? `set-type-${s.type}` : ''}`}>{letter || si + 1}</span>
                      <span className="set-result">{result}</span>
                      <span className="set-e1rm muted">
                        {s.weight > 0 && s.reps > 1 ? `~${toDisplayVal(s.weight * (1 + s.reps / 30), unit)} 1RM` : ''}
                      </span>
                      <span />
                      <span className={`set-check set-check-static ${s.done ? 'set-check-on' : ''}`}>
                        {s.done && <Icon name="check" size={15} strokeWidth={3} />}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="wd-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              dispatch({ t: 'startAgain', workoutId: workout.id })
              ui.push({ k: 'logger' })
            }}
          >
            <Icon name="repeat" size={18} /> Start Again
          </button>
          <button className="btn btn-ghost" onClick={saveAsRoutine} disabled={savedRoutine}>
            <Icon name="note" size={16} /> {savedRoutine ? 'Saved' : 'Save as Routine'}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <Confirm
          title="Delete workout?"
          message="This workout and its logs will be permanently removed."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            dispatch({ t: 'deleteWorkout', id })
            ui.pop()
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
