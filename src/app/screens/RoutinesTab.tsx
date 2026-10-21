import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Confirm, Sheet } from '../../components/ui'
import type { Routine } from '../../lib/types'

const DEFAULT_FOLDER = 'My Routines'

/** Hevy-style routine card: title, exercise preview, one-tap start. */
function RoutineCard({ routine, onMenu }: { routine: Routine; onMenu: (r: Routine) => void }) {
  const { state, dispatch, getExercise } = useStore()
  const ui = useUI()
  const preview =
    routine.exercises
      .map((e) => getExercise(e.exerciseId)?.name ?? 'Exercise')
      .join(' · ') || 'No exercises yet'
  const setCount = routine.exercises.reduce((s, e) => s + e.sets.length, 0)

  return (
    <div className="rt-card">
      <div className="rt-card-head">
        <button
          className="rt-title-btn"
          onClick={() => ui.push({ k: 'routine', id: routine.id })}
        >
          <strong className="rt-title">{routine.name}</strong>
          <span className="rt-meta">
            {routine.exercises.length} exercise{routine.exercises.length === 1 ? '' : 's'} ·{' '}
            {setCount} set{setCount === 1 ? '' : 's'}
          </span>
        </button>
        <button
          className="icon-btn rt-more"
          aria-label={`Options for ${routine.name}`}
          onClick={() => onMenu(routine)}
        >
          <Icon name="dots" size={20} />
        </button>
      </div>
      <p className="rt-preview">{preview}</p>
      <button
        className="rt-start"
        onClick={() => {
          dispatch({ t: 'startWorkout', routineId: routine.id })
          ui.push({ k: 'logger' })
        }}
      >
        <Icon name="play" size={16} fill="currentColor" /> Start Routine
      </button>
    </div>
  )
}

/** A collapsible folder of routines. */
function FolderSection({
  name,
  routines,
  custom,
  defaultOpen = true,
  onMenu,
}: {
  name: string
  routines: Routine[]
  custom: boolean
  defaultOpen?: boolean
  onMenu: (r: Routine) => void
}) {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const [open, setOpen] = useState(defaultOpen)
  const [folderMenu, setFolderMenu] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameVal, setRenameVal] = useState(name)
  const [confirmDel, setConfirmDel] = useState(false)
  const isDefault = name === DEFAULT_FOLDER

  return (
    <section className="rt-folder">
      <header className="rt-folder-head">
        <button className="rt-folder-toggle" onClick={() => setOpen((o) => !o)}>
          <Icon
            name="chevronDown"
            size={16}
            className={`rt-caret ${open ? '' : 'rt-caret-closed'}`}
          />
          <span className="rt-folder-name">
            {isDefault ? DEFAULT_FOLDER : name}{' '}
            <span className="rt-folder-count">({routines.length})</span>
          </span>
        </button>
        {custom && (
          <button
            className="icon-btn"
            aria-label={`Options for ${name}`}
            onClick={() => setFolderMenu(true)}
          >
            <Icon name="dots" size={20} />
          </button>
        )}
      </header>

      {open && (
        <>
          <div className="rt-folder-body">
            {routines.map((r) => (
              <RoutineCard key={r.id} routine={r} onMenu={onMenu} />
            ))}
            {routines.length === 0 && (
              <p className="rt-folder-empty">
                {isDefault
                  ? 'Nothing here yet — build your first routine below.'
                  : 'Empty folder. Move routines here from their ⋯ menu.'}
              </p>
            )}
            {isDefault && (
              <button className="rt-add-slot" onClick={() => ui.push({ k: 'routineEditor' })}>
                <Icon name="plus" size={18} /> Add new routine
              </button>
            )}
          </div>

          {folderMenu && (
            <Sheet title={name} onClose={() => setFolderMenu(false)}>
              <div className="sheet-actions">
                <button
                  className="btn btn-ghost btn-lg"
                  onClick={() => {
                    setFolderMenu(false)
                    setRenameOpen(true)
                  }}
                >
                  <Icon name="edit" size={16} /> Rename folder
                </button>
                <button
                  className="btn btn-ghost btn-lg btn-danger-ghost"
                  onClick={() => {
                    setFolderMenu(false)
                    setConfirmDel(true)
                  }}
                >
                  <Icon name="trash" size={16} /> Delete folder
                </button>
              </div>
            </Sheet>
          )}

          {renameOpen && (
            <Sheet title="Rename folder" onClose={() => setRenameOpen(false)}>
              <input
                className="sheet-input"
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                placeholder="Folder name"
                aria-label="Folder name"
              />
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  const to = renameVal.trim()
                  if (!to) {
                    ui.toast('Enter a folder name first')
                    return
                  }
                  if (to === name) {
                    setRenameOpen(false)
                    return
                  }
                  if (state.folders.includes(to)) {
                    ui.toast('A folder with that name already exists')
                    return
                  }
                  dispatch({ t: 'renameFolder', from: name, to })
                  setRenameOpen(false)
                  ui.toast('Folder renamed')
                }}
              >
                Rename
              </button>
            </Sheet>
          )}

          {confirmDel && (
            <Confirm
              title={`Delete “${name}”?`}
              message={`The folder goes away; its ${routines.length} routine${
                routines.length === 1 ? '' : 's'
              } move back to My Routines.`}
              confirmLabel="Delete"
              danger
              onConfirm={() => {
                dispatch({ t: 'deleteFolder', name })
                setConfirmDel(false)
                ui.toast('Folder deleted')
              }}
              onCancel={() => setConfirmDel(false)}
            />
          )}
        </>
      )}
    </section>
  )
}

export default function RoutinesTab() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [menuRoutine, setMenuRoutine] = useState<Routine | null>(null)
  const [moveOpen, setMoveOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const mine = state.routines.filter((r) => !r.folder)

  return (
    <div className="tab-screen">
      <header className="page-head hv-topbar">
        <h1>Workout</h1>
        <button
          className="icon-btn hv-circle-btn"
          aria-label="Sync status"
          onClick={() => ui.toast('Everything is saved on this device')}
        >
          <Icon name="refresh" size={20} />
        </button>
      </header>

      <button
        className="hv-cta"
        onClick={() => {
          dispatch({ t: 'startWorkout' })
          ui.push({ k: 'logger' })
        }}
      >
        <Icon name="plus" size={22} /> Start Empty Workout
      </button>

      <div className="hv-routines-head">
        <h2>Routines</h2>
        <button className="icon-btn" aria-label="New folder" onClick={() => setNewFolderOpen(true)}>
          <Icon name="folderPlus" size={22} />
        </button>
      </div>

      <div className="hv-action-grid">
        <button className="hv-action" onClick={() => ui.push({ k: 'routineEditor' })}>
          <Icon name="clipboard" size={20} /> New Routine
        </button>
        <button className="hv-action" onClick={() => ui.push({ k: 'exercises' })}>
          <Icon name="search" size={20} /> Explore
        </button>
      </div>

      {state.folders.map((f) => (
        <FolderSection
          key={f}
          name={f}
          custom
          defaultOpen={false}
          routines={state.routines.filter((r) => r.folder === f)}
          onMenu={setMenuRoutine}
        />
      ))}

      <FolderSection name={DEFAULT_FOLDER} custom={false} routines={mine} onMenu={setMenuRoutine} />

      {newFolderOpen && (
        <Sheet title="New folder" onClose={() => setNewFolderOpen(false)}>
          <input
            className="sheet-input"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name (e.g. Push / Pull / Legs)"
            aria-label="Folder name"
          />
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              const name = folderName.trim()
              if (!name) {
                ui.toast('Enter a folder name first')
                return
              }
              if (state.folders.includes(name)) {
                ui.toast('A folder with that name already exists')
                return
              }
              dispatch({ t: 'addFolder', name })
              setFolderName('')
              setNewFolderOpen(false)
              ui.toast('Folder created')
            }}
          >
            Create folder
          </button>
        </Sheet>
      )}

      {menuRoutine && !moveOpen && !confirmDelete && (
        <Sheet title={menuRoutine.name} onClose={() => setMenuRoutine(null)}>
          <div className="sheet-actions">
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                dispatch({ t: 'startWorkout', routineId: menuRoutine.id })
                setMenuRoutine(null)
                ui.push({ k: 'logger' })
              }}
            >
              <Icon name="play" size={16} fill="currentColor" /> Start Routine
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                const id = menuRoutine.id
                setMenuRoutine(null)
                ui.push({ k: 'routineEditor', id })
              }}
            >
              <Icon name="edit" size={16} /> Edit Routine
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                setMoveOpen(true)
              }}
            >
              <Icon name="folderPlus" size={16} /> Move to folder
            </button>
            <button
              className="btn btn-ghost btn-lg btn-danger-ghost"
              onClick={() => {
                setConfirmDelete(true)
              }}
            >
              <Icon name="trash" size={16} /> Delete routine
            </button>
          </div>
        </Sheet>
      )}

      {moveOpen && menuRoutine && (
        <Sheet title="Move to folder" onClose={() => setMoveOpen(false)}>
          <div className="sheet-actions">
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => {
                dispatch({ t: 'moveRoutine', id: menuRoutine.id, folder: null })
                setMoveOpen(false)
                setMenuRoutine(null)
                ui.toast('Moved to My Routines')
              }}
            >
              <Icon name="layers" size={16} /> My Routines
            </button>
            {state.folders.map((f) => (
              <button
                key={f}
                className="btn btn-ghost btn-lg"
                onClick={() => {
                  dispatch({ t: 'moveRoutine', id: menuRoutine.id, folder: f })
                  setMoveOpen(false)
                  setMenuRoutine(null)
                  ui.toast(`Moved to ${f}`)
                }}
              >
                <Icon name="layers" size={16} /> {f}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {confirmDelete && menuRoutine && (
        <Confirm
          title="Delete routine?"
          message={`“${menuRoutine.name}” will be removed. Past workouts are not affected.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            dispatch({ t: 'deleteRoutine', id: menuRoutine.id })
            setConfirmDelete(false)
            setMenuRoutine(null)
            ui.toast('Routine deleted')
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
