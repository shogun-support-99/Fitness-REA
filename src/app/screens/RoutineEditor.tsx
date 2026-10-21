import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { ExerciseThumb } from '../../components/media'
import { Sheet } from '../../components/ui'
import type { Routine, RoutineSet } from '../../lib/types'
import { fmtNum, fmtRest, toDisplayVal, toKg, uid } from '../../lib/utils'
import { imgUrl } from '../../data/exercises'

const REST_OPTIONS = [0, 30, 45, 60, 90, 120, 180]

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
      className="re-input"
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
  const [menuEx, setMenuEx] = useState<number | null>(null)
  const [restEx, setRestEx] = useState<number | null>(null)
  const [noteEx, setNoteEx] = useState<number | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

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
        folder: existing?.folder,
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
    <div className="subscreen routine-editor">
      <header className="re-topbar">
        <button className="re-cancel" onClick={() => ui.pop()}>
          Cancel
        </button>
        <h2>{existing ? 'Edit Routine' : 'New Routine'}</h2>
        <button className="re-update" onClick={save}>
          Update
        </button>
      </header>

      <div className="re-body">
        <div className="re-title-row">
          <input
            className="re-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Routine name"
            aria-label="Routine name"
          />
          {name.length > 0 && (
            <button
              className="re-clear"
              aria-label="Clear name"
              onClick={() => setName('')}
            >
              <Icon name="x" size={13} />
            </button>
          )}
        </div>

        {exercises.map((ex, ei) => {
          const meta = getExercise(ex.exerciseId)
          const isCardio = meta?.category === 'cardio'
          const rest = ex.restSec ?? state.settings.defaultRest
          return (
            <div className="re-ex" key={ei}>
              <div className="re-ex-head">
                {meta?.media ? (
                  <img className="re-ex-thumb" src={imgUrl(meta.media)} alt="" loading="lazy" />
                ) : (
                  <span className="re-ex-thumb re-ex-thumb-fallback">
                    <ExerciseThumb media={meta?.media} size={20} />
                  </span>
                )}
                <button
                  className="re-ex-name"
                  onClick={() => ui.push({ k: 'exercise', id: ex.exerciseId })}
                >
                  {meta?.name ?? 'Exercise'}
                </button>
                <button
                  className="icon-btn"
                  aria-label="Exercise options"
                  onClick={() => setMenuEx(ei)}
                >
                  <Icon name="dotsV" size={20} />
                </button>
              </div>

              <div className="re-pills">
                <button className="re-pill" onClick={() => setRestEx(ei)}>
                  <Icon name="timer" size={15} />
                  {rest === 0 ? 'Rest: OFF' : `Rest: ${fmtRest(rest)}`}
                </button>
                <button
                  className="re-pill"
                  onClick={() => {
                    setNoteEx(ei)
                    setNoteDraft(ex.notes ?? '')
                  }}
                >
                  <Icon name="note" size={15} />
                  {ex.notes ? 'Note ✓' : 'Note'}
                </button>
              </div>

              <div className="re-grid">
                <div className="re-row re-row-head">
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
                    s.type !== 'normal'
                      ? s.type === 'warmup'
                        ? 'W'
                        : s.type === 'drop'
                          ? 'D'
                          : 'F'
                      : ''
                  return (
                    <div className="re-row" key={si}>
                      <button
                        className={`re-set-badge ${letter ? `set-type-${s.type}` : ''}`}
                        onClick={() => cycleType(ei, si)}
                        title="Tap to change set type (W/D/F)"
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
                        className="re-row-del"
                        aria-label="Remove set"
                        onClick={() => patch((l) => l[ei].sets.splice(si, 1))}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <button
                className="re-add-set"
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
                <Icon name="plus" size={15} /> Add Set
              </button>
            </div>
          )
        })}

        <button
          className="re-add-ex"
          onClick={() => ui.push({ k: 'picker', onPick: addExercises })}
        >
          <Icon name="plus" size={18} /> Add Exercise
        </button>
      </div>

      {menuEx !== null && exercises[menuEx] && (
        <Sheet title={getExercise(exercises[menuEx].exerciseId)?.name ?? 'Exercise'} onClose={() => setMenuEx(null)}>
          <div className="sheet-actions">
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                const target = menuEx
                setMenuEx(null)
                ui.push({ k: 'exercise', id: exercises[target].exerciseId })
              }}
            >
              <Icon name="info" size={16} /> View exercise
            </button>
            <button
              className="btn btn-ghost btn-lg btn-danger-ghost"
              onClick={() => {
                patch((l) => l.splice(menuEx, 1))
                setMenuEx(null)
              }}
            >
              <Icon name="trash" size={16} /> Remove exercise
            </button>
          </div>
        </Sheet>
      )}

      {restEx !== null && exercises[restEx] && (
        <Sheet title="Rest timer" onClose={() => setRestEx(null)}>
          <div className="sheet-actions">
            {REST_OPTIONS.map((sec) => (
              <button
                key={sec}
                className={`btn btn-ghost btn-lg ${
                  (exercises[restEx].restSec ?? state.settings.defaultRest) === sec ? 'btn-primary' : ''
                }`}
                onClick={() => {
                  patch((l) => (l[restEx].restSec = sec))
                  setRestEx(null)
                }}
              >
                <Icon name="timer" size={16} />
                {sec === 0 ? 'OFF' : fmtRest(sec)}
              </button>
            ))}
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                patch((l) => (l[restEx].restSec = state.settings.defaultRest))
                setRestEx(null)
              }}
            >
              <Icon name="zap" size={16} /> Default ({fmtRest(state.settings.defaultRest)})
            </button>
          </div>
        </Sheet>
      )}

      {noteEx !== null && exercises[noteEx] && (
        <Sheet title="Exercise note" onClose={() => setNoteEx(null)}>
          <textarea
            className="sheet-textarea"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Cues, setup, reminders…"
            rows={4}
          />
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              patch((l) => (l[noteEx].notes = noteDraft.trim()))
              setNoteEx(null)
            }}
          >
            Save note
          </button>
        </Sheet>
      )}
    </div>
  )
}
