import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { EmptyState } from '../../components/ui'

export default function RoutinesTab() {
  const { state } = useStore()
  const ui = useUI()

  return (
    <div className="tab-screen">
      <header className="page-head">
        <h1>Routines</h1>
        <button className="btn btn-primary btn-sm" onClick={() => ui.push({ k: 'routineEditor' })}>
          <Icon name="plus" size={16} /> New
        </button>
      </header>

      {state.routines.length === 0 ? (
        <EmptyState
          icon="layers"
          title="No routines yet"
          message="Build a routine once, then start it with one tap every session."
          action={
            <button className="btn btn-primary" onClick={() => ui.push({ k: 'routineEditor' })}>
              <Icon name="plus" size={16} /> Create routine
            </button>
          }
        />
      ) : (
        <div className="list">
          {state.routines.map((r) => {
            const sets = r.exercises.reduce((s, e) => s + e.sets.length, 0)
            return (
              <button
                key={r.id}
                className="card row-item"
                onClick={() => ui.push({ k: 'routine', id: r.id })}
              >
                <div className="row-icon">
                  <Icon name="layers" size={20} />
                </div>
                <div className="row-main">
                  <strong>{r.name}</strong>
                  <span>
                    {r.exercises.length} exercise{r.exercises.length === 1 ? '' : 's'} · {sets} set
                    {sets === 1 ? '' : 's'}
                  </span>
                </div>
                <Icon name="chevronRight" size={16} className="row-chevron" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
