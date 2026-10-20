import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { beep, fmtClock } from '../lib/utils'
import { Icon, type IconName } from '../components/icons'
import { UICtx, type Screen, type Tab } from './uiContext'
import Home from './screens/Home'
import RoutinesTab from './screens/RoutinesTab'
import ExercisesTab from './screens/ExercisesTab'
import FeedTab from './screens/FeedTab'
import ProfileTab from './screens/ProfileTab'
import Logger from './screens/Logger'
import Picker from './screens/Picker'
import CustomExercise from './screens/CustomExercise'
import ExerciseDetail from './screens/ExerciseDetail'
import WorkoutDetail from './screens/WorkoutDetail'
import RoutineDetail from './screens/RoutineDetail'
import RoutineEditor from './screens/RoutineEditor'
import HistoryScreen from './screens/History'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'routines', label: 'Routines', icon: 'layers' },
  { id: 'exercises', label: 'Exercises', icon: 'book' },
  { id: 'feed', label: 'Feed', icon: 'users' },
  { id: 'profile', label: 'Profile', icon: 'user' },
]

interface RestState {
  endsAt: number
  total: number
  done: boolean
}

function ScreenLayer({ screen }: { screen: Screen }) {
  switch (screen.k) {
    case 'logger':
      return <Logger />
    case 'picker':
      return <Picker onPick={screen.onPick} />
    case 'customExercise':
      return <CustomExercise />
    case 'exercise':
      return <ExerciseDetail id={screen.id} />
    case 'workout':
      return <WorkoutDetail id={screen.id} />
    case 'routine':
      return <RoutineDetail id={screen.id} />
    case 'routineEditor':
      return <RoutineEditor id={screen.id} />
    case 'history':
      return <HistoryScreen />
  }
}

function RestBanner({
  rest,
  adjust,
  stop,
}: {
  rest: RestState
  adjust: (s: number) => void
  stop: () => void
}) {
  const [, force] = useState(0)
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 250)
    return () => clearInterval(t)
  }, [])
  const remaining = Math.max(0, rest.endsAt - Date.now())
  const pct = rest.done ? 1 : 1 - remaining / (rest.total * 1000)
  const R = 17
  const C = 2 * Math.PI * R
  return (
    <div className={`rest-banner ${rest.done ? 'rest-done' : ''}`}>
      <svg width="42" height="42" viewBox="0 0 42 42" className="rest-ring">
        <circle cx="21" cy="21" r={R} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="21"
          cy="21"
          r={R}
          fill="none"
          stroke={rest.done ? 'var(--good)' : 'var(--accent)'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 21 21)"
        />
        <text x="21" y="25" textAnchor="middle" className="rest-ring-text">
          {rest.done ? '✓' : fmtClock(remaining).replace(/^0:/, '')}
        </text>
      </svg>
      <div className="rest-label">
        {rest.done ? (
          <>
            <strong>Rest complete</strong>
            <span>Let’s go!</span>
          </>
        ) : (
          <>
            <strong>Rest</strong>
            <span>{fmtClock(remaining)}</span>
          </>
        )}
      </div>
      {rest.done ? (
        <button className="rest-skip" onClick={stop}>
          Dismiss
        </button>
      ) : (
        <div className="rest-actions">
          <button onClick={() => adjust(15)}>+15s</button>
          <button onClick={() => adjust(60)}>+1m</button>
          <button className="rest-skip" onClick={stop}>
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function AppShell() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [stack, setStack] = useState<Screen[]>([])
  const [rest, setRest] = useState<RestState | null>(null)
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null)
  const toastTimer = useRef<number | null>(null)

  // Load the full 1,300+ exercise dataset chunk after first paint.
  // A failure is never silent: the status surfaces in the Exercises tab and
  // picker, with a retry.
  const [datasetStatus, setDatasetStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const loadDataset = useCallback(() => {
    setDatasetStatus('loading')
    import('../data/exercises-dataset')
      .then((m) => {
        dispatch({ t: 'datasetLoaded', exercises: m.DATASET_EXERCISES })
        setDatasetStatus('ready')
      })
      .catch(() => {
        console.warn('exercise dataset chunk failed to load')
        setDatasetStatus('error')
      })
  }, [])
  useEffect(() => {
    if (state.dataset.length > 0) setDatasetStatus('ready')
    else loadDataset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast({ msg, id: Date.now() })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2000)
  }, [])

  const api = {
    push: (s: Screen) => setStack((st) => [...st, s]),
    pop: () => setStack((st) => st.slice(0, -1)),
    resetTo: (t: Tab) => {
      setStack([])
      setTab(t)
    },
    toast: showToast,
    startRest: (sec: number) => setRest({ endsAt: Date.now() + sec * 1000, total: sec, done: false }),
    adjustRest: (sec: number) =>
      setRest((r) =>
        r && !r.done
          ? { ...r, endsAt: r.endsAt + sec * 1000, total: Math.max(r.total, 30) + sec }
          : r
      ),
    stopRest: () => setRest(null),
    datasetStatus,
    retryDataset: loadDataset,
  }

  // rest countdown completion
  useEffect(() => {
    if (!rest || rest.done) return
    const t = setInterval(() => {
      if (Date.now() >= rest.endsAt) {
        if (state.settings.sound) beep(2)
        setRest((r) => (r ? { ...r, done: true } : r))
        window.setTimeout(() => setRest((r) => (r?.done ? null : r)), 2600)
      }
    }, 200)
    return () => clearInterval(t)
  }, [rest, state.settings.sound])

  const top = stack.length > 0 ? stack[stack.length - 1] : null

  return (
    <UICtx.Provider value={api}>
      <div className="app-root">
        <div className="app-frame">
          <div className={`app-scroll ${top ? 'app-scroll-pushed' : ''}`}>
            {!top && (
              <main className="screen" key={tab}>
                {tab === 'home' && <Home />}
                {tab === 'routines' && <RoutinesTab />}
                {tab === 'exercises' && <ExercisesTab />}
                {tab === 'feed' && <FeedTab />}
                {tab === 'profile' && <ProfileTab />}
              </main>
            )}
          </div>
          {top && (
            <div className="screen pushed" key={stack.length}>
              <ScreenLayer screen={top} />
            </div>
          )}
          {!top && (
            <nav className="tabbar">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`tab ${tab === t.id ? 'tab-on' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <Icon name={t.icon} size={22} />
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          )}
          {rest && <RestBanner rest={rest} adjust={api.adjustRest} stop={api.stopRest} />}
          {toast && (
            <div className="toast" key={toast.id}>
              {toast.msg}
            </div>
          )}
        </div>
      </div>
    </UICtx.Provider>
  )
}
