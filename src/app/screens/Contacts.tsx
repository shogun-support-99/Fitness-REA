import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Avatar } from '../../components/ui'

export default function Contacts() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [imported, setImported] = useState(0)

  const add = () => {
    if (!name.trim() && !handle.trim()) return
    dispatch({ t: 'addContact', name, handle })
    setName('')
    setHandle('')
  }

  const runImport = () => {
    let count = 0
    for (const line of importText.split('\n')) {
      const raw = line.trim()
      if (!raw) continue
      const [a, b] = raw.split(',').map((x) => x.trim())
      if (a || b) {
        dispatch({ t: 'addContact', name: a || b || '', handle: b || a || '' })
        count++
      }
    }
    setImported(count)
    setImportText('')
    if (count > 0) ui.toast(`${count} contact${count === 1 ? '' : 's'} added`)
  }

  const shareProfile = () => {
    const url = `${location.origin}${location.pathname}#/app`
    navigator.clipboard?.writeText(url).then(
      () => ui.toast('App link copied — send it to a friend'),
      () => ui.toast(url)
    )
  }

  return (
    <div className="subscreen contacts">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="chevronLeft" size={22} />
        </button>
        <h2>Contacts</h2>
        <button className="icon-btn" onClick={shareProfile} aria-label="Share app link">
          <Icon name="external" size={18} />
        </button>
      </header>

      <div className="contacts-body">
        <div className="card contacts-add">
          <h3 className="card-title">Add a contact</h3>
          <div className="contacts-add-row">
            <input
              className="field-input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="field-input"
              placeholder="@handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={add}>
              <Icon name="plus" size={16} /> Add
            </button>
          </div>
          <button className="link-btn" onClick={() => setImportOpen((o) => !o)}>
            {importOpen ? 'Hide bulk import' : 'Import many at once'}
          </button>
          {importOpen && (
            <div className="contacts-import">
              <textarea
                placeholder={'One per line:\nMaya Reyes, maya.lifts\nDev Sharma, dev.squats'}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <button className="btn btn-ghost btn-sm" onClick={runImport} disabled={!importText.trim()}>
                Import contacts
              </button>
              {imported > 0 && <p className="muted small">Added {imported}.</p>}
            </div>
          )}
        </div>

        {state.contacts.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <Icon name="users" size={26} />
            </div>
            <h3>No contacts yet</h3>
            <p>
              Add your training partners above, or open a workout share link someone sends you —
              they join your feed automatically.
            </p>
          </div>
        ) : (
          <div className="list">
            {state.contacts.map((c) => (
              <div key={c.id} className="card row-item contact-row">
                <Avatar name={c.name} color={c.color} size={38} />
                <div className="row-main">
                  <strong>{c.name}</strong>
                  <span>@{c.handle}</span>
                </div>
                <button
                  className={`btn btn-sm ${c.followed ? 'btn-ghost' : 'btn-follow'}`}
                  onClick={() => dispatch({ t: 'toggleContactFollow', id: c.id })}
                >
                  {c.followed ? 'Following' : 'Follow'}
                </button>
                <button
                  className="icon-btn icon-danger"
                  aria-label={`Remove ${c.name}`}
                  onClick={() => dispatch({ t: 'deleteContact', id: c.id })}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="muted small contacts-note">
          REA Fit is serverless and free: contacts stay on your device, and sharing happens through
          workout links — whatever app you already use carries them.
        </p>
      </div>
    </div>
  )
}
