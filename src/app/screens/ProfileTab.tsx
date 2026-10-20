import { useMemo, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Avatar, Confirm, Segmented, Toggle } from '../../components/ui'
import { BarChart } from '../../components/charts'
import type { AppState } from '../../lib/types'
import { downloadJSON, fmtVolume, weekStart, workoutStreak, workoutVolume } from '../../lib/utils'

export default function ProfileTab() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const { settings, workouts } = state
  const unit = settings.unit

  const totalVolume = workouts.reduce((s, w) => s + workoutVolume(w), 0)
  const totalSets = workouts.reduce(
    (s, w) => s + w.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0),
    0
  )
  const streak = workoutStreak(workouts)

  const weekly = useMemo(() => {
    const weeks: { label: string; value: number }[] = []
    const thisWeek = weekStart(Date.now())
    for (let i = 9; i >= 0; i--) {
      const start = thisWeek - i * 7 * 86400000
      const end = start + 7 * 86400000
      const vol = workouts
        .filter((w) => w.start >= start && w.start < end)
        .reduce((s, w) => s + workoutVolume(w), 0)
      const d = new Date(start)
      const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
      weeks.push({ label: vol > 0 ? `${months[d.getMonth()]}${Math.ceil(d.getDate() / 7)}` : '', value: Math.round(vol) })
    }
    return weeks
  }, [workouts])

  const importFile = (f: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppState
        if (!parsed || !Array.isArray(parsed.workouts)) throw new Error('bad shape')
        dispatch({ t: 'importData', state: parsed })
        ui.toast('Data imported')
      } catch {
        ui.toast('Could not read that file')
      }
    }
    reader.readAsText(f)
  }

  return (
    <div className="tab-screen">
      <header className="page-head">
        <h1>Profile</h1>
        <a className="btn btn-ghost btn-sm" href="#/">
          <Icon name="external" size={14} /> Website
        </a>
      </header>

      <div className="card profile-card">
        <Avatar name={settings.name} size={56} />
        <div className="profile-info">
          <h2>{settings.name}</h2>
          <span className="muted">
            {workouts.length} workout{workouts.length === 1 ? '' : 's'} logged
          </span>
        </div>
      </div>

      <div className="stat-row stat-row-4">
        <div className="card stat-card">
          <strong>{workouts.length}</strong>
          <span>workouts</span>
        </div>
        <div className="card stat-card">
          <strong>{fmtVolume(totalVolume, unit)}</strong>
          <span>volume</span>
        </div>
        <div className="card stat-card">
          <strong>{totalSets}</strong>
          <span>sets</span>
        </div>
        <div className="card stat-card streak-card">
          <Icon name="flame" size={18} className="flame" />
          <div>
            <strong>{streak}</strong>
            <span>streak</span>
          </div>
        </div>
      </div>

      <div className="card chart-card">
        <h3 className="card-title">Weekly volume ({unit})</h3>
        <BarChart data={weekly} format={(v) => fmtVolume(v, unit)} />
      </div>

      <section className="section">
        <h3 className="section-title">Settings</h3>
        <div className="card settings-card">
          <label className="setting-row">
            <span>
              <Icon name="user" size={16} /> Name
            </span>
            <input
              className="setting-input"
              value={settings.name}
              onChange={(e) => dispatch({ t: 'settings', patch: { name: e.target.value } })}
            />
          </label>
          <div className="setting-row">
            <span>
              <Icon name="dumbbell" size={16} /> Units
            </span>
            <Segmented
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'lb', label: 'lb' },
              ]}
              value={settings.unit}
              onChange={(unit) => dispatch({ t: 'settings', patch: { unit } })}
            />
          </div>
          <div className="setting-row">
            <span>
              <Icon name={settings.theme === 'dark' ? 'moon' : 'sun'} size={16} /> Theme
            </span>
            <Segmented
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
              value={settings.theme}
              onChange={(theme) => dispatch({ t: 'settings', patch: { theme } })}
            />
          </div>
          <div className="setting-row">
            <span>
              <Icon name="timer" size={16} /> Rest timer
            </span>
            <div className="stepper">
              <button onClick={() => dispatch({ t: 'settings', patch: { defaultRest: Math.max(15, settings.defaultRest - 15) } })}>
                −
              </button>
              <span>{settings.defaultRest}s</span>
              <button onClick={() => dispatch({ t: 'settings', patch: { defaultRest: Math.min(300, settings.defaultRest + 15) } })}>
                +
              </button>
            </div>
          </div>
          <div className="setting-row">
            <span>
              <Icon name="zap" size={16} /> Auto-start rest
            </span>
            <Toggle
              on={settings.restAutoStart}
              onChange={(restAutoStart) => dispatch({ t: 'settings', patch: { restAutoStart } })}
            />
          </div>
          <div className="setting-row">
            <span>
              <Icon name="target" size={16} /> Sounds
            </span>
            <Toggle
              on={settings.sound}
              onChange={(sound) => dispatch({ t: 'settings', patch: { sound } })}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Data</h3>
        <div className="card settings-card">
          <button
            className="setting-row setting-btn"
            onClick={() => downloadJSON('reafit-backup.json', state)}
          >
            <span>
              <Icon name="download" size={16} /> Export data
            </span>
            <Icon name="chevronRight" size={14} className="muted" />
          </button>
          <button className="setting-row setting-btn" onClick={() => fileRef.current?.click()}>
            <span>
              <Icon name="upload" size={16} /> Import backup
            </span>
            <Icon name="chevronRight" size={14} className="muted" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importFile(f)
              e.target.value = ''
            }}
          />
          <button
            className="setting-row setting-btn"
            disabled={state.sampleLoaded}
            onClick={() => {
              dispatch({ t: 'loadSample' })
              ui.toast('Sample data loaded')
            }}
          >
            <span>
              <Icon name="layers" size={16} /> Load sample data
            </span>
            {state.sampleLoaded ? <span className="muted small">loaded</span> : <Icon name="chevronRight" size={14} className="muted" />}
          </button>
          <button className="setting-row setting-btn danger" onClick={() => setConfirmClear(true)}>
            <span>
              <Icon name="trash" size={16} /> Clear all data
            </span>
          </button>
        </div>
      </section>

      <div className="card about-card">
        <div className="about-logo">RF</div>
        <div>
          <strong>REA Fit</strong>
          <p className="muted small">
            v1.0 · An open-source, Hevy-inspired workout tracker. Your data never leaves this
            device.
          </p>
        </div>
      </div>

      {confirmClear && (
        <Confirm
          title="Clear all data?"
          message="Workouts, routines, settings and custom exercises will be wiped from this device."
          confirmLabel="Erase everything"
          danger
          onConfirm={() => {
            dispatch({ t: 'clearAll' })
            setConfirmClear(false)
            ui.toast('All data cleared')
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  )
}
