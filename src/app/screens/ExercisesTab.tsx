import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { ExerciseThumb } from '../../components/media'
import { Icon } from '../../components/icons'
import { EQUIPMENTS, MUSCLE_GROUPS, searchExercises } from '../../data/exercises'
import type { Equipment, MuscleGroup } from '../../lib/types'

const PAGE = 60

export default function ExercisesTab() {
  const { allExercises } = useStore()
  const ui = useUI()
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all')
  const [equipment, setEquipment] = useState<Equipment | 'all'>('all')
  const [limit, setLimit] = useState(PAGE)

  const list = useMemo(
    () => searchExercises(allExercises, q, muscle, equipment),
    [allExercises, q, muscle, equipment]
  )
  const shown = list.slice(0, limit)

  // reset paging whenever the query changes
  useEffect(() => setLimit(PAGE), [q, muscle, equipment])

  // progressive loading: fetch the next page as the sentinel nears view
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || limit >= list.length) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((l) => Math.min(l + PAGE, list.length))
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [limit, list.length])

  return (
    <div className="tab-screen">
      <header className="page-head">
        <h1>
          Exercises <span className="head-count">{allExercises.length.toLocaleString()}</span>
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => ui.push({ k: 'customExercise' })}>
          <Icon name="plus" size={16} /> Custom
        </button>
      </header>

      <div className="picker-tools">
        <div className="search-box">
          <Icon name="search" size={16} />
          <input
            placeholder={`Search ${allExercises.length.toLocaleString()} exercises…`}
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
          ? `${list.length.toLocaleString()} exercises`
          : `${list.length.toLocaleString()} of ${allExercises.length.toLocaleString()} exercises`}
      </p>

      {ui.datasetStatus === 'error' && (
        <div className="dataset-banner" role="alert">
          <Icon name="info" size={18} />
          <span>The full library (1,200+ extra exercises) didn’t load.</span>
          <button className="link-btn" onClick={ui.retryDataset}>
            Try again
          </button>
        </div>
      )}

      <div className="list">
        {shown.map((ex) => (
          <button
            key={ex.id}
            className="card row-item"
            onClick={() => ui.push({ k: 'exercise', id: ex.id })}
          >
            <div className="row-thumb">
              <ExerciseThumb media={ex.media} size={20} />
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

      {ui.datasetStatus === 'loading' && allExercises.length < 200 && (
        <div className="dataset-banner">
          <Icon name="dumbbell" size={18} className="spin" />
          <span>Loading the exercise library…</span>
        </div>
      )}

      {limit < list.length && (
        <div ref={sentinelRef} className="picker-cap">
          {shown.length.toLocaleString()} of {list.length.toLocaleString()} — keep scrolling
        </div>
      )}
      {limit >= list.length && list.length > PAGE && (
        <p className="picker-cap">End of the list — {list.length.toLocaleString()} exercises.</p>
      )}
    </div>
  )
}
