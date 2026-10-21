import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Avatar, Confirm, Segmented, Sheet } from '../../components/ui'
import { BarChart } from '../../components/charts'
import { FeedPosts } from './FeedTab'
import { getAccount, session } from '../../lib/auth'
import {
  fmtVolume,
  ordinal,
  timeAgo,
  weekStart,
  workoutStreak,
  workoutVolume,
  workoutSetCount,
} from '../../lib/utils'

type Metric = 'duration' | 'volume' | 'reps'
type Range = 1 | 3 | 6
const RANGES: { value: Range; label: string }[] = [
  { value: 1, label: 'Last month' },
  { value: 3, label: 'Last 3 months' },
  { value: 6, label: 'Last 6 months' },
]

export default function ProfileTab() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const account = getAccount(session() ?? '')
  const { settings, workouts } = state
  const unit = settings.unit

  const [metric, setMetric] = useState<Metric>('duration')
  const [range, setRange] = useState<Range>(3)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState(settings.name)
  const [seg, setSeg] = useState<'you' | 'following'>('you')
  const [menuWorkout, setMenuWorkout] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)

  const streak = workoutStreak(workouts)
  const following = state.contacts.filter((c) => c.followed).length + state.followedHandles.length
  const myPosts = state.posts.filter((p) => p.author.kind === 'me').length

  // weekly buckets for the chart, per selected metric
  const weeks = useMemo(() => {
    const out: { label: string; value: number }[] = []
    const thisWeek = weekStart(Date.now())
    const n = range === 1 ? 5 : range === 3 ? 13 : 26
    for (let i = n - 1; i >= 0; i--) {
      const start = thisWeek - i * 7 * 86400000
      const end = start + 7 * 86400000
      const inWeek = workouts.filter((w) => w.start >= start && w.start < end)
      const value =
        metric === 'volume'
          ? Math.round(inWeek.reduce((s, w) => s + workoutVolume(w), 0))
          : metric === 'reps'
            ? inWeek.reduce((s, w) => s + workoutSetCount(w), 0)
            : Math.round(inWeek.reduce((s, w) => s + (w.end - w.start), 0) / 60000)
      out.push({ label: '', value })
    }
    return out
  }, [workouts, metric, range])

  const hasData = weeks.some((w) => w.value > 0)
  const metricFormat =
    metric === 'volume'
      ? (v: number) => fmtVolume(v, unit)
      : metric === 'reps'
        ? (v: number) => `${v} reps`
        : (v: number) => `${v}m`

  const shareProfile = () => {
    const link = `${location.origin}${location.pathname}#/app`
    const done = () => ui.toast('App link copied')
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(done, () => ui.toast(link))
    } else {
      ui.toast(link)
    }
  }

  const sorted = [...workouts].sort((a, b) => b.start - a.start)
  const menuW = workouts.find((w) => w.id === menuWorkout)

  return (
    <div className="tab-screen">
      <header className="page-head hv-topbar">
        <h1 className="hv-username">{account?.handle ?? settings.name}</h1>
        <div className="head-actions">
          <button
            className="icon-btn"
            aria-label="Edit profile"
            onClick={() => {
              setNameDraft(settings.name)
              setNameOpen(true)
            }}
          >
            <Icon name="edit" size={20} />
          </button>
          <button className="icon-btn" aria-label="Share app" onClick={shareProfile}>
            <Icon name="share" size={20} />
          </button>
          <button className="icon-btn" aria-label="Settings" onClick={() => ui.push({ k: 'settings' })}>
            <Icon name="gear" size={20} />
          </button>
        </div>
      </header>

      <div className="hv-identity">
        <Avatar name={settings.name} color={account?.color} size={80} />
        <div className="hv-id-main">
          <strong className="hv-id-name">{settings.name}</strong>
          <div className="hv-counters">
            <button className="hv-counter" onClick={() => setSeg('you')}>
              <strong>{workouts.length}</strong>
              <span>Workouts</span>
            </button>
            <button className="hv-counter" onClick={() => setSeg('following')}>
              <strong>{following}</strong>
              <span>Following</span>
            </button>
            <div className="hv-counter">
              <strong>{myPosts}</strong>
              <span>Posts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hv-chart-block">
        <button className="hv-range-btn" onClick={() => setRangeOpen(true)}>
          {RANGES.find((r) => r.value === range)?.label} <Icon name="chevronDown" size={16} />
        </button>
        <div className="hv-chart-card">
          {hasData ? (
            <BarChart data={weeks} height={150} format={metricFormat} />
          ) : (
            <div className="hv-chart-empty">
              <Icon name="bars" size={42} />
              <p>No data in time period</p>
            </div>
          )}
        </div>
        <div className="hv-metric-pills">
          <button
            className={`hv-metric ${metric === 'duration' ? 'hv-metric-on' : ''}`}
            onClick={() => setMetric('duration')}
          >
            Duration
          </button>
          <button
            className={`hv-metric ${metric === 'volume' ? 'hv-metric-on' : ''}`}
            onClick={() => setMetric('volume')}
          >
            Volume
          </button>
          <button
            className={`hv-metric ${metric === 'reps' ? 'hv-metric-on' : ''}`}
            onClick={() => setMetric('reps')}
          >
            Reps
          </button>
        </div>
      </div>

      <p className="hv-section-label">Dashboard</p>
      <div className="hv-dash-grid">
        <button className="hv-tile" onClick={() => ui.push({ k: 'bodyDist' })}>
          <Icon name="trend" size={20} /> Statistics
        </button>
        <button className="hv-tile" onClick={() => ui.push({ k: 'exercises' })}>
          <Icon name="dumbbell" size={20} /> Exercises
        </button>
        <button className="hv-tile" onClick={() => ui.push({ k: 'measurements' })}>
          <Icon name="ruler" size={20} /> Measures
        </button>
        <button className="hv-tile" onClick={() => ui.push({ k: 'calendar' })}>
          <Icon name="calendar" size={20} /> Calendar
        </button>
      </div>

      <div className="hv-workouts-head">
        <p className="hv-section-label">Workouts</p>
        <div className="hv-seg">
          <Segmented
            options={[
              { value: 'you', label: 'You' },
              { value: 'following', label: 'Following' },
            ]}
            value={seg}
            onChange={setSeg}
          />
        </div>
      </div>

      {seg === 'you' ? (
        <div className="hv-feed">
          {sorted.length === 0 && (
            <p className="hv-feed-empty">
              Nothing here yet — your finished workouts will show up in this list.
            </p>
          )}
          {sorted.map((w, i) => {
            const nth = sorted.length - i
            return (
              <div className="hv-feed-item" key={w.id}>
                <Avatar name={settings.name} color={account?.color} size={44} />
                <button className="hv-feed-main" onClick={() => ui.push({ k: 'workout', id: w.id })}>
                  <strong>{settings.name}</strong>
                  <span className="hv-feed-badge">
                    <Icon name="dumbbell" size={11} /> {ordinal(nth)} workout
                  </span>
                  <span className="hv-feed-date">
                    {timeAgo(w.start)} · {fmtVolume(workoutVolume(w), unit)} {unit} ·{' '}
                    {w.exercises.length} exercise{w.exercises.length === 1 ? '' : 's'}
                  </span>
                </button>
                <button
                  className="icon-btn"
                  aria-label="Options"
                  onClick={() => setMenuWorkout(w.id)}
                >
                  <Icon name="dots" size={20} />
                </button>
              </div>
            )
          })}
          <p className="hv-streak-note">
            <Icon name="flame" size={14} className="flame" /> {streak}-day streak · keep it going
          </p>
        </div>
      ) : (
        <div className="hv-feed">
          <FeedPosts />
        </div>
      )}

      {rangeOpen && (
        <Sheet title="Time period" onClose={() => setRangeOpen(false)}>
          <div className="sheet-actions">
            {RANGES.map((r) => (
              <button
                key={r.value}
                className={`btn btn-ghost btn-lg ${range === r.value ? 'btn-primary' : ''}`}
                onClick={() => {
                  setRange(r.value)
                  setRangeOpen(false)
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {nameOpen && (
        <Sheet title="Edit profile" onClose={() => setNameOpen(false)}>
          <input
            className="sheet-input"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Display name"
            aria-label="Display name"
          />
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              const name = nameDraft.trim()
              if (name) dispatch({ t: 'settings', patch: { name } })
              setNameOpen(false)
              ui.toast('Profile updated')
            }}
          >
            Update
          </button>
        </Sheet>
      )}

      {menuWorkout && menuW && !confirmDel && (
        <Sheet title={menuW.name} onClose={() => setMenuWorkout(null)}>
          <div className="sheet-actions">
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                const id = menuW.id
                setMenuWorkout(null)
                ui.push({ k: 'workout', id })
              }}
            >
              <Icon name="logbook" size={16} /> View workout
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                dispatch({ t: 'startAgain', workoutId: menuW.id })
                setMenuWorkout(null)
                ui.push({ k: 'logger' })
              }}
            >
              <Icon name="repeat" size={16} /> Perform again
            </button>
            <button
              className="btn btn-ghost btn-lg btn-danger-ghost"
              onClick={() => setConfirmDel(true)}
            >
              <Icon name="trash" size={16} /> Delete workout
            </button>
          </div>
        </Sheet>
      )}

      {confirmDel && menuW && (
        <Confirm
          title="Delete workout?"
          message="This workout and all of its sets will be removed from this device."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            dispatch({ t: 'deleteWorkout', id: menuW.id })
            setConfirmDel(false)
            setMenuWorkout(null)
            ui.toast('Workout deleted')
          }}
          onCancel={() => setConfirmDel(false)}
        />
      )}
    </div>
  )
}
