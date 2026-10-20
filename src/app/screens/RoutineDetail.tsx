import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Confirm } from '../../components/ui'
import { fmtWeight } from '../../lib/utils'

export default function RoutineDetail({ id }: { id: string }) {
  const { state, dispatch, getExercise } = useStore()
  const ui = useUI()
  const unit = state.settings.unit
  const [confirmDelete, setConfirmDelete] = useState(false)
  const routine = state.routines.find((r) => r.id === id)
  if (!routine) return null

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="chevronLeft" size={22} />
        </button>
        <h2 className="truncate">{routine.name}</h2>
        <button className="icon-btn" onClick={() => ui.push({ k: 'routineEditor', id })} aria-label="Edit routine">
          <Icon name="edit" size={18} />
        </button>
      </header>

      <div className="rdetail">
        <div className="card quiet-card">
          <Icon name="info" size={18} />
          <span>
            {routine.exercises.length} exercise{routine.exercises.length === 1 ? '' : 's'} ·{' '}
            {routine.exercises.reduce((s, e) => s + e.sets.length, 0)} sets
          </span>
        </div>

        {routine.exercises.map((ex, i) => {
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
                {ex.sets.map((s, si) => {
                  const letter =
                    s.type !== 'normal' ? (s.type === 'warmup' ? 'W' : s.type === 'drop' ? 'D' : 'F') : ''
                  const result = isCardio
                    ? `${s.duration > 0 ? `${s.duration} min` : ''}${s.distance > 0 ? `${s.duration > 0 ? ' · ' : ''}${s.distance} km` : ''}`
                    : s.weight > 0
                      ? `${fmtWeight(s.weight, unit)} ${unit} × ${s.reps}`
                      : `${s.reps} reps`
                  return (
                    <div className="set-row set-row-flat" key={si}>
                      <span className={`set-type ${letter ? `set-type-${s.type}` : ''}`}>
                        {letter || si + 1}
                      </span>
                      <span className="set-result">{result}</span>
                      <span />
                      <span />
                      <span />
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
              dispatch({ t: 'startWorkout', routineId: routine.id })
              ui.push({ k: 'logger' })
            }}
          >
            <Icon name="play" size={18} fill="currentColor" /> Start Workout
          </button>
          <button className="btn btn-ghost btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" size={16} /> Delete routine
          </button>
        </div>
      </div>

      {confirmDelete && (
        <Confirm
          title="Delete routine?"
          message={`“${routine.name}” will be removed. Past workouts are not affected.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            dispatch({ t: 'deleteRoutine', id })
            ui.pop()
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
