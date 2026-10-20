import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { EQUIPMENTS, MUSCLE_GROUPS, imgUrl, searchExercises } from '../../data/exercises'
import type { Equipment, MuscleGroup } from '../../lib/types'

const RENDER_CAP = 60

export default function ExercisesTab() {
  const { allExercises } = useStore()
  const ui = useUI()
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all')
  const [equipment, setEquipment] = useState<Equipment | 'all'>('all')

  const list = useMemo(
    () => searchExercises(allExercises, q, muscle, equipment),
    [allExercises, q, muscle, equipment]
  )
  const shown = list.slice(0, RENDER_CAP)

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
            placeholder={`Search ${allExercises.length} exercises…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="chip-row">
          <button className={`chip ${muscle === 'all' ? 'chip-on' : ''}`} onClick={() => setMuscle('all')}>
            All muscles
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
        <div className="chip-row">
          <button
            className={`chip ${equipment === 'all' ? 'chip-on' : ''}`}
            onClick={() => setEquipment('all')}
          >
            All equipment
          </button>
          {EQUIPMENTS.map((eq) => (
            <button
              key={eq}
              className={`chip ${equipment === eq ? 'chip-on' : ''}`}
              onClick={() => setEquipment(eq)}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      <p className="muted small">
        {list.length === allExercises.length
          ? `${list.length} exercises`
          : `${list.length} of ${allExercises.length} exercises`}
      </p>

      <div className="list">
        {shown.map((ex) => (
          <button
            key={ex.id}
            className="card row-item"
            onClick={() => ui.push({ k: 'exercise', id: ex.id })}
          >
            <div className="row-thumb">
              {ex.media ? (
                <img loading="lazy" src={imgUrl(ex.media)} alt="" />
              ) : (
                <Icon name="dumbbell" size={20} />
              )}
            </div>
            <div className="row-main">
              <strong>
                {ex.name} {ex.custom && <em className="custom-tag">custom</em>}
              </strong>
              <span>
                {ex.equipment} · {ex.primary}
                {ex.instructions ? ' · guide' : ''}
              </span>
            </div>
            <Icon name="chevronRight" size={16} className="row-chevron" />
          </button>
        ))}
      </div>

      {list.length > RENDER_CAP && (
        <p className="picker-cap">Showing {RENDER_CAP} of {list.length} — search or filter to narrow it down.</p>
      )}
    </div>
  )
}
