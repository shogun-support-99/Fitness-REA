import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { MUSCLE_GROUPS, searchExercises } from '../../data/exercises'
import type { MuscleGroup } from '../../lib/types'

export default function ExercisesTab() {
  const { allExercises } = useStore()
  const ui = useUI()
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all')

  const list = useMemo(() => searchExercises(allExercises, q, muscle), [allExercises, q, muscle])

  return (
    <div className="tab-screen">
      <header className="page-head">
        <h1>Exercises</h1>
        <button className="btn btn-primary btn-sm" onClick={() => ui.push({ k: 'customExercise' })}>
          <Icon name="plus" size={16} /> Custom
        </button>
      </header>

      <div className="picker-tools">
        <div className="search-box">
          <Icon name="search" size={16} />
          <input
            placeholder="Search exercises…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="chip-row">
          <button className={`chip ${muscle === 'all' ? 'chip-on' : ''}`} onClick={() => setMuscle('all')}>
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

      <p className="muted small">{list.length} exercises</p>

      <div className="list">
        {list.map((ex) => (
          <button
            key={ex.id}
            className="card row-item"
            onClick={() => ui.push({ k: 'exercise', id: ex.id })}
          >
            <div className="row-icon">
              <Icon name="dumbbell" size={20} />
            </div>
            <div className="row-main">
              <strong>
                {ex.name} {ex.custom && <em className="custom-tag">custom</em>}
              </strong>
              <span>
                {ex.equipment} · {ex.primary}
              </span>
            </div>
            <Icon name="chevronRight" size={16} className="row-chevron" />
          </button>
        ))}
      </div>
    </div>
  )
}
