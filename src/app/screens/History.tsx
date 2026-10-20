import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { EmptyState } from '../../components/ui'
import { fmtDate, fmtDuration, fmtVolume, workoutSetCount, workoutVolume } from '../../lib/utils'

function monthLabel(ts: number): string {
  const d = new Date(ts)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function History() {
  const { state } = useStore()
  const ui = useUI()
  const unit = state.settings.unit

  const groups = useMemo(() => {
    const map = new Map<string, typeof state.workouts>()
    for (const w of [...state.workouts].sort((a, b) => b.start - a.start)) {
      const key = monthLabel(w.start)
      const list = map.get(key) ?? []
      list.push(w)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [state.workouts])

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="chevronLeft" size={22} />
        </button>
        <h2>Workout History</h2>
        <span className="muted">{state.workouts.length} total</span>
      </header>

      {state.workouts.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No workouts yet"
          message="Finished workouts will show up here."
        />
      ) : (
        <div className="history">
          {groups.map(([month, list]) => (
            <section key={month} className="section">
              <h3 className="section-title">{month}</h3>
              <div className="list">
                {list.map((w) => (
                  <button
                    key={w.id}
                    className="card row-item"
                    onClick={() => ui.push({ k: 'workout', id: w.id })}
                  >
                    <div className="row-icon">
                      <Icon name="dumbbell" size={20} />
                    </div>
                    <div className="row-main">
                      <strong>{w.name}</strong>
                      <span>
                        {fmtDate(w.start)} · {w.exercises.length} exercises ·{' '}
                        {workoutSetCount(w)} sets
                      </span>
                    </div>
                    <div className="row-side">
                      <strong className="vol">{fmtVolume(workoutVolume(w), unit)}</strong>
                      <span className="muted">{fmtDuration(w.end - w.start)}</span>
                    </div>
                    <Icon name="chevronRight" size={16} className="row-chevron" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
