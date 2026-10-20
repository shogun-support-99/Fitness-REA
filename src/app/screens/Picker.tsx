import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { MUSCLE_GROUPS, searchExercises } from '../../data/exercises'
import { ExerciseThumb } from '../../components/media'
import type { MuscleGroup } from '../../lib/types'

const RENDER_CAP = 60

export default function Picker({ onPick }: { onPick: (ids: string[]) => void }) {
  const { allExercises } = useStore()
  const ui = useUI()
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all')
  const [selected, setSelected] = useState<string[]>([])

  const list = useMemo(() => searchExercises(allExercises, q, muscle), [allExercises, q, muscle])
  const shown = list.slice(0, RENDER_CAP)

  const toggle = (id: string) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((i) => i !== id) : [...sel, id]))

  return (
    <div className="picker">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Cancel">
          <Icon name="x" size={20} />
        </button>
        <h2>Add Exercises</h2>
        <button
          className="btn btn-primary btn-sm"
          disabled={selected.length === 0}
          onClick={() => {
            onPick(selected)
            ui.pop()
          }}
        >
          Add{selected.length > 0 ? ` (${selected.length})` : ''}
        </button>
      </header>

      <div className="picker-tools">
        <div className="search-box">
          <Icon name="search" size={16} />
          <input
            autoFocus
            placeholder={`Search ${allExercises.length} exercises…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="chip-row">
          <button
            className={`chip ${muscle === 'all' ? 'chip-on' : ''}`}
            onClick={() => setMuscle('all')}
          >
            All
          </button>
          {MUSCLE_GROUPS.map((m) => (
            <button
              key={m.id}
              className={`chip ${muscle === m.id ? 'chip-on' : ''}`}
              onClick={() => setMuscle(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="picker-list">
        {shown.map((ex) => {
          const on = selected.includes(ex.id)
          return (
            <button key={ex.id} className={`picker-row ${on ? 'picker-row-on' : ''}`} onClick={() => toggle(ex.id)}>
              <span className={`picker-check ${on ? 'picker-check-on' : ''}`}>
                {on && <Icon name="check" size={13} strokeWidth={3} />}
              </span>
              <span className="picker-thumb">
                <ExerciseThumb media={ex.media} size={16} />
              </span>
              <span className="picker-name">
                {ex.name}
                {ex.custom && <em className="custom-tag">custom</em>}
              </span>
              <span className="picker-meta">
                {ex.equipment} · {ex.primary}
              </span>
            </button>
          )
        })}
        {list.length > RENDER_CAP && (
          <p className="picker-cap">
            Showing {RENDER_CAP} of {list.length} — keep typing to narrow it down.
          </p>
        )}
        {list.length === 0 && <p className="picker-empty">No exercises match “{q}”.</p>}
      </div>

      <div className="picker-foot">
        <button className="btn btn-ghost" onClick={() => ui.push({ k: 'customExercise' })}>
          <Icon name="plus" size={16} /> Create custom exercise
        </button>
      </div>
    </div>
  )
}
