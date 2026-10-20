import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import type { Routine, RoutineSet, Workout } from '../../lib/types'
import { fmtNum, toDisplayVal, toKg, uid } from '../../lib/utils'

function NumCell({
  value,
  onCommit,
  placeholder,
}: {
  value: number
  onCommit: (v: number) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? (value > 0 ? fmtNum(value) : '')
  return (
    <input
      className="cell-input"
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
  )
}

export default function RoutineEditor({ id }: { id?: string }) {
  const { state, dispatch, getExercise } = useStore()
  const ui = useUI()
  const unit = state.settings.unit
  const existing = id ? state.routines.find((r) => r.id === id) : undefined
  const [name, setName] = useState(existing?.name ?? 'New Routine')
  const [exercises, setExercises] = useState<Routine['exercises']>(
    existing
      ? (JSON.parse(JSON.stringify(existing.exercises)) as Routine['exercises'])
      : []
  )

  const patch = (fn: (list: Routine['exercises']) => void) => {
    const list: Routine['exercises'] = JSON.parse(JSON.stringify(exercises))
    fn(list)
    setExercises(list)
  }

  const addExercises = (ids: string[]) =>
    patch((list) => {
      for (const exId of ids) {
        list.push({
          exerciseId: exId,
          notes: '',
          sets: [{ type: 'normal', weight: 0, reps: 0, duration: 0, distance: 0 }],
        })
      }
    })

  const save = () => {
    if (exercises.length === 0) {
      ui.toast('Add at least one exercise')
      return
    }
    dispatch({
      t: 'saveRoutine',
      routine: {
        id: existing?.id ?? uid(),
        name: name.trim() || 'Routine',
        createdAt: existing?.createdAt ?? Date.now(),
        exercises,
      },
    })
    ui.toast(existing ? 'Routine updated' : 'Routine created')
    ui.pop()
  }

  const cycleType = (ei: number, si: number) =>
    patch((list) => {
      const s = list[ei].sets[si]
      const order: RoutineSet['type'][] = ['normal', 'warmup', 'drop', 'failure']
      s.type = order[(order.indexOf(s.type) + 1) % order.length]
    })

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Cancel">
          <Icon name="x" size={20} />
        </button>
        <h2>{existing ? 'Edit Routine' : 'New Routine'}</h2>
        <button className="btn btn-primary btn-sm" onClick={save}>
          Save
        </button>
      </header>

      <div className="re-body">
        <input
          className="re-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Routine name"
          aria-label="Routine name"
        />

        {exercises.map((ex, ei) => {
          const meta = getExercise(ex.exerciseId)
          const isCardio = meta?.category === 'cardio'
          return (
            <div className="card ex-card" key={ei}>
              <div className="ex-head">
                <div className="ex-title">
                  <h3>{meta?.name ?? 'Exercise'}</h3>
                  <span className="ex-sub">{meta?.equipment}</span>
                </div>
                <div className="ex-actions">
                  <button
                    className="icon-btn icon-danger"
                    onClick={() => patch((l) => l.splice(ei, 1))}
                    aria-label="Remove exercise"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
              <div className="set-grid set-grid-edit">
                <div className="set-row set-row-head">
                  <span>SET</span>
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
                  <span />
                </div>
                {ex.sets.map((s, si) => {
                  const letter =
                    s.type !== 'normal' ? (s.type === 'warmup' ? 'W' : s.type === 'drop' ? 'D' : 'F') : ''
                  return (
                    <div className="set-row" key={si}>
                      <button
                        className={`set-type ${letter ? `set-type-${s.type}` : ''}`}
                        onClick={() => cycleType(ei, si)}
                        title="Tap to change set type"
                      >
                        {letter || si + 1}
                      </button>
                      {isCardio ? (
                        <>
                          <NumCell
                            value={s.duration}
                            onCommit={(v) => patch((l) => (l[ei].sets[si].duration = v))}
                          />
                          <NumCell
                            value={s.distance}
                            onCommit={(v) => patch((l) => (l[ei].sets[si].distance = v))}
                          />
                        </>
                      ) : (
                        <>
                          <NumCell
                            value={toDisplayVal(s.weight, unit)}
                            onCommit={(v) => patch((l) => (l[ei].sets[si].weight = toKg(v, unit)))}
                          />
                          <NumCell
                            value={s.reps}
                            onCommit={(v) => patch((l) => (l[ei].sets[si].reps = Math.round(v)))}
                          />
                        </>
                      )}
                      <button
                        className="icon-btn icon-danger"
                        onClick={() => patch((l) => l[ei].sets.splice(si, 1))}
                        aria-label="Remove set"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  )
                })}
              </div>
              <button
                className="add-set-btn"
                onClick={() =>
                  patch((l) => {
                    const last = l[ei].sets[l[ei].sets.length - 1]
                    l[ei].sets.push({
                      type: 'normal',
                      weight: last?.weight ?? 0,
                      reps: last?.reps ?? 0,
                      duration: last?.duration ?? 0,
                      distance: last?.distance ?? 0,
                    })
                  })
                }
              >
                <Icon name="plus" size={14} /> Add Set
              </button>
            </div>
          )
        })}

        <button
          className="btn btn-ghost btn-lg add-ex-btn"
          onClick={() => ui.push({ k: 'picker', onPick: addExercises })}
        >
          <Icon name="plus" size={18} /> Add Exercise
        </button>
      </div>
    </div>
  )
}
