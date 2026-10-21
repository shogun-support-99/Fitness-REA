import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { beep, fmtClock, fmtElapsed } from '../lib/utils'
import { Icon, type IconName } from '../components/icons'
import { Confirm } from '../components/ui'
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
import Contacts from './screens/Contacts'
import BodyDistribution from './screens/BodyDistribution'
import Settings from './screens/Settings'
import Measurements from './screens/Measurements'
import CalendarScreen from './screens/CalendarScreen'

/** Hevy-style 3-tab bottom navigation. */
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'workout', label: 'Workout', icon: 'dumbbell' },
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
    case 'contacts':
      return <Contacts />
    case 'bodyDist':
      return <BodyDistribution />
    case 'settings':
      return <Settings />
    case 'measurements':
      return <Measurements />
    case 'calendar':
      return <CalendarScreen />
    case 'exercises':
      return <ExercisesTab embedded />
    case 'feed':
      return <FeedTab embedded />
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

/** Hevy-style persistent mini-bar: keeps a live session visible from any tab. */
function ActiveWorkoutBar({ onResume, onDiscard }: { onResume: () => void; onDiscard: () => void }) {
  const { state } = useStore()
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const active = state.active
  if (!active) return null
  return (
    <div className="active-bar" role="status">
      <button className="active-bar-main" onClick={onResume}>
        <span className="active-bar-pulse" />
        <span className="active-bar-label">Active workout</span>
        <span className="active-bar-timer">{fmtElapsed(Date.now() - active.start)}</span>
      </button>
      <button className="active-bar-discard" onClick={onDiscard} aria-label="Discard workout">
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}

export default function AppShell({ onSignOut }: { onSignOut: () => void }) {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [stack, setStack] = useState<Screen[]>([])
  const [rest, setRest] = useState<RestState | null>(null)
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const toastTimer = useRef<number | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast({ msg, id: Date.now() })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2000)
  }, [])

  // a share link opened while signed out parks its code; add it once inside
  useEffect(() => {
    try {
      const code = sessionStorage.getItem('reafit-pending-share')
      if (code) {
        sessionStorage.removeItem('reafit-pending-share')
        dispatch({ t: 'importSharedPost', code })
        showToast('Shared workout added to your feed')
      }
    } catch {
      /* private mode */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    logout: onSignOut,
    switchAccount: onSignOut,
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
  const showBar = !!state.active && top?.k !== 'logger'

  return (
    <UICtx.Provider value={api}>
      <div className="app-root">
        <div className={`app-frame ${showBar ? 'has-active-bar' : ''}`}>
          <div className={`app-scroll ${top ? 'app-scroll-pushed' : ''}`}>
            {!top && (
              <main className="screen" key={tab}>
                {tab === 'home' && <Home />}
                {tab === 'workout' && <RoutinesTab />}
                {tab === 'profile' && <ProfileTab />}
              </main>
            )}
          </div>
          {top && (
            <div className="screen pushed" key={stack.length}>
              <ScreenLayer screen={top} />
            </div>
          )}
          {showBar && (
            <ActiveWorkoutBar
              onResume={() => api.push({ k: 'logger' })}
              onDiscard={() => setConfirmDiscard(true)}
            />
          )}
          {!top && (
            <nav className="tabbar" aria-label="Main navigation">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`tab ${tab === t.id ? 'tab-on' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <span className="tab-pill">
                    <Icon name={t.icon} size={22} />
                  </span>
                  <span className="tab-label">{t.label}</span>
                </button>
              ))}
              <div className="tabbar-homebar" aria-hidden="true" />
            </nav>
          )}
          {rest && <RestBanner rest={rest} adjust={api.adjustRest} stop={api.stopRest} />}
          {confirmDiscard && (
            <Confirm
              title="Discard workout?"
              message="Your logged sets for this session will be lost."
              confirmLabel="Discard"
              danger
              onConfirm={() => {
                dispatch({ t: 'discardActive' })
                setConfirmDiscard(false)
                showToast('Workout discarded')
              }}
              onCancel={() => setConfirmDiscard(false)}
            />
          )}
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
