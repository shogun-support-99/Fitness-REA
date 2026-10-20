import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Avatar } from '../../components/ui'
import {
  dayKey,
  fmtDuration,
  fmtVolume,
  greeting,
  timeAgo,
  weekStart,
  workoutStreak,
  workoutVolume,
} from '../../lib/utils'

const WEEK_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function Home() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const { workouts, routines, settings, active } = state
  const { allExercises } = useStore()
  const unit = settings.unit

  const ws = weekStart(Date.now())
  const weekDays = Array.from({ length: 7 }, (_, i) => ws + i * 86400000)
  const workoutDays = new Set(workouts.map((w) => dayKey(w.start)))
  const todayKey = dayKey(Date.now())

  const thisWeek = workouts.filter((w) => w.start >= ws)
  const weekVolume = thisWeek.reduce((s, w) => s + workoutVolume(w), 0)
  const weekDuration = thisWeek.reduce((s, w) => s + (w.end - w.start), 0)
  const streak = workoutStreak(workouts)

  const startEmpty = () => {
    dispatch({ t: 'startWorkout' })
    ui.push({ k: 'logger' })
  }
  const startRoutine = (id: string) => {
    dispatch({ t: 'startWorkout', routineId: id })
    ui.push({ k: 'logger' })
  }

  return (
    <div className="home">
      <header className="page-head">
        <div>
          <p className="greeting">{greeting()},</p>
          <h1>{settings.name}</h1>
        </div>
        <Avatar name={settings.name} size={40} />
      </header>

      <div className="week-strip card">
        {weekDays.map((d, i) => {
          const dk = dayKey(d)
          const has = workoutDays.has(dk)
          const isToday = dk === todayKey
          return (
            <div key={i} className={`week-day ${isToday ? 'week-today' : ''}`}>
              <span className="week-letter">{WEEK_LETTERS[i]}</span>
              <span className={`week-dot ${has ? 'week-dot-on' : ''}`} />
            </div>
          )
        })}
      </div>

      <div className="stat-row">
        <div className="card stat-card streak-card">
          <Icon name="flame" size={20} className="flame" />
          <div>
            <strong>{streak}</strong>
            <span>day streak</span>
          </div>
        </div>
        <div className="card stat-card">
          <strong>{thisWeek.length}</strong>
          <span>workouts</span>
        </div>
        <div className="card stat-card">
          <strong>{fmtVolume(weekVolume, unit)}</strong>
          <span>volume ({unit})</span>
        </div>
        <div className="card stat-card">
          <strong>{weekDuration ? fmtDuration(weekDuration) : '0m'}</strong>
          <span>trained</span>
        </div>
      </div>

      {active ? (
        <button
          className="btn btn-primary btn-lg continue-btn"
          onClick={() => ui.push({ k: 'logger' })}
        >
          <Icon name="play" size={18} fill="currentColor" />
          Continue Workout
        </button>
      ) : (
        <button className="btn btn-primary btn-lg" onClick={startEmpty}>
          <Icon name="plus" size={20} />
          Start Empty Workout
        </button>
      )}

      {routines.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Quick Start</h2>
          </div>
          <div className="quick-scroll">
            {routines.map((r) => (
              <button key={r.id} className="quick-card card" onClick={() => startRoutine(r.id)}>
                <div className="quick-icon">
                  <Icon name="play" size={16} fill="currentColor" />
                </div>
                <div className="quick-info">
                  <strong>{r.name}</strong>
                  <span>
                    {r.exercises.length} exercise{r.exercises.length === 1 ? '' : 's'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Recent Workouts</h2>
            {workouts.length > 0 && (
              <button className="link-btn" onClick={() => ui.push({ k: 'history' })}>
                History
              </button>
            )}
        </div>
        {workouts.length === 0 ? (
          <div className="card empty-inline">
            {state.sampleLoaded ? (
              <>
                <p>No workouts yet — your first one is one tap away.</p>
              </>
            ) : (
              <>
                <p>
                  <strong>New here?</strong> Load sample data to explore the app, or start from a
                  blank slate.
                </p>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    dispatch({ t: 'loadSample' })
                    ui.toast('Sample data loaded')
                  }}
                >
                  Load sample data
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="list">
            {workouts.slice(0, 4).map((w) => (
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
                    {timeAgo(w.start)} · {fmtDuration(w.end - w.start)} ·{' '}
                    {w.exercises.length} exercises
                  </span>
                </div>
                <div className="row-side">
                  <strong className="vol">{fmtVolume(workoutVolume(w), unit)}</strong>
                  <span className="muted">{unit}</span>
                </div>
                <Icon name="chevronRight" size={16} className="row-chevron" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <button className="card row-item" onClick={() => ui.resetTo('exercises')}>
          <div className="row-icon">
            <Icon name="book" size={20} />
          </div>
          <div className="row-main">
            <strong>Exercise library</strong>
            <span>{allExercises.length.toLocaleString()} exercises</span>
          </div>
          <Icon name="chevronRight" size={16} className="row-chevron" />
        </button>
      </section>
    </div>
  )
}
