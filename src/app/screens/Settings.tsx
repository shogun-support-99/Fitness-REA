import { useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Confirm, Segmented, Sheet, Toggle } from '../../components/ui'
import type { AppState } from '../../lib/types'
import { downloadJSON, fmtRest } from '../../lib/utils'
import { getAccount, session } from '../../lib/auth'

type Pane =
  | null
  | 'profile'
  | 'account'
  | 'notifications'
  | 'backup'
  | 'workouts'
  | 'units'
  | 'theme'

export default function Settings() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const fileRef = useRef<HTMLInputElement>(null)
  const account = getAccount(session() ?? '')
  const { settings } = state
  const [pane, setPane] = useState<Pane>(null)
  const [nameDraft, setNameDraft] = useState(settings.name)
  const [confirmClear, setConfirmClear] = useState(false)

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

  const Row = ({
    icon,
    label,
    pane: open,
    last,
    onClick,
  }: {
    icon: Parameters<typeof Icon>[0]['name']
    label: string
    pane?: Pane
    last?: boolean
    onClick?: () => void
  }) => (
    <button
      className="st-row"
      style={last ? { borderBottom: 'none' } : undefined}
      onClick={onClick ?? (() => setPane(open ?? null))}
    >
      <Icon name={icon} size={20} />
      <span className="st-row-label">{label}</span>
      <Icon name="chevronRight" size={16} className="st-chevron" />
    </button>
  )

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="arrowLeft" size={22} />
        </button>
        <h2>Settings</h2>
        <span className="sub-head-spacer" />
      </header>

      <div className="st-body">
        <p className="st-group-label">Account</p>
        <div className="st-group">
          <Row icon="user" label="Profile" pane="profile" />
          <Row icon="target" label="Account" pane="account" />
          <Row icon="zap" label="Notifications" pane="notifications" />
          <Row icon="download" label="Backup & Data" pane="backup" last />
        </div>

        <p className="st-group-label">Preferences</p>
        <div className="st-group">
          <Row icon="dumbbell" label="Workouts" pane="workouts" />
          <Row icon="users" label="Contacts & Social" onClick={() => ui.push({ k: 'contacts' })} />
          <Row icon="ruler" label="Units" pane="units" />
          <Row icon={settings.theme === 'dark' ? 'moon' : 'sun'} label="Theme" pane="theme" last />
        </div>

        <p className="st-foot muted small">
          REA Fit v1.1.1 · free forever, no ads · your data never leaves this device.
          <br />
          Exercise data: exercises-dataset (MIT) · media © Gym visual
        </p>
      </div>

      {pane === 'profile' && (
        <Sheet title="Profile" onClose={() => setPane(null)}>
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
              setPane(null)
              ui.toast('Profile updated')
            }}
          >
            Update
          </button>
        </Sheet>
      )}

      {pane === 'account' && (
        <Sheet title="Account" onClose={() => setPane(null)}>
          <div className="st-account">
            <div className="st-account-row">
              <span className="muted">Signed in as</span>
              <strong>@{account?.handle ?? 'athlete'}</strong>
            </div>
            <div className="st-account-row">
              <span className="muted">Type</span>
              <strong>{account?.kind === 'guest' ? 'Guest account' : 'Local account'}</strong>
            </div>
            <p className="muted small">
              Local accounts live entirely on this device. Passwords are hashed here and never
              sent anywhere.
            </p>
          </div>
          <div className="sheet-actions">
            <button className="btn btn-ghost btn-lg" onClick={ui.switchAccount}>
              <Icon name="repeat" size={16} /> Switch account
            </button>
            <button className="btn btn-ghost btn-lg btn-danger-ghost" onClick={ui.logout}>
              <Icon name="arrowRight" size={16} /> Log out
            </button>
          </div>
        </Sheet>
      )}

      {pane === 'notifications' && (
        <Sheet title="Notifications" onClose={() => setPane(null)}>
          <div className="st-toggle-row">
            <span>Sounds (rest timer, PRs)</span>
            <Toggle
              on={settings.sound}
              onChange={(sound) => dispatch({ t: 'settings', patch: { sound } })}
            />
          </div>
          <p className="muted small">
            REA Fit never sends push notifications or emails — nothing about you leaves the
            device.
          </p>
        </Sheet>
      )}

      {pane === 'backup' && (
        <Sheet title="Backup & Data" onClose={() => setPane(null)}>
          <p className="muted small">
            Everything is stored on this device. Export a backup before switching phones or
            clearing browser data.
          </p>
          <div className="sheet-actions">
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => downloadJSON('reafit-backup.json', state)}
            >
              <Icon name="download" size={16} /> Export data
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={16} /> Import backup
            </button>
            <button className="btn btn-ghost btn-lg btn-danger-ghost" onClick={() => setConfirmClear(true)}>
              <Icon name="trash" size={16} /> Clear all data
            </button>
          </div>
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
        </Sheet>
      )}

      {pane === 'workouts' && (
        <Sheet title="Workouts" onClose={() => setPane(null)}>
          <div className="st-toggle-row">
            <span>Default rest</span>
            <div className="stepper">
              <button
                onClick={() =>
                  dispatch({
                    t: 'settings',
                    patch: { defaultRest: Math.max(15, settings.defaultRest - 15) },
                  })
                }
              >
                −
              </button>
              <span>{fmtRest(settings.defaultRest)}</span>
              <button
                onClick={() =>
                  dispatch({
                    t: 'settings',
                    patch: { defaultRest: Math.min(300, settings.defaultRest + 15) },
                  })
                }
              >
                +
              </button>
            </div>
          </div>
          <div className="st-toggle-row">
            <span>Auto-start rest timer</span>
            <Toggle
              on={settings.restAutoStart}
              onChange={(restAutoStart) => dispatch({ t: 'settings', patch: { restAutoStart } })}
            />
          </div>
        </Sheet>
      )}

      {pane === 'units' && (
        <Sheet title="Units" onClose={() => setPane(null)}>
          <div className="st-toggle-row">
            <span>Weight units</span>
            <Segmented
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'lb', label: 'lb' },
              ]}
              value={settings.unit}
              onChange={(unit) => dispatch({ t: 'settings', patch: { unit } })}
            />
          </div>
        </Sheet>
      )}

      {pane === 'theme' && (
        <Sheet title="Theme" onClose={() => setPane(null)}>
          <div className="st-toggle-row">
            <span>Appearance</span>
            <Segmented
              options={[
                { value: 'dark', label: 'Dark (OLED)' },
                { value: 'light', label: 'Light' },
              ]}
              value={settings.theme}
              onChange={(theme) => dispatch({ t: 'settings', patch: { theme } })}
            />
          </div>
        </Sheet>
      )}

      {confirmClear && (
        <Confirm
          title="Clear all data?"
          message="Workouts, routines, measurements, settings and custom exercises will be wiped from this device."
          confirmLabel="Erase everything"
          danger
          onConfirm={() => {
            dispatch({ t: 'clearAll' })
            setConfirmClear(false)
            setPane(null)
            ui.toast('All data cleared')
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  )
}
