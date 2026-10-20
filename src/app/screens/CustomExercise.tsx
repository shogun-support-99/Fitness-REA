import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { MUSCLE_GROUPS } from '../../data/exercises'
import type { Equipment, MuscleGroup } from '../../lib/types'
import { uid } from '../../lib/utils'

export default function CustomExercise() {
  const { dispatch } = useStore()
  const ui = useUI()
  const [name, setName] = useState('')
  const [equipment, setEquipment] = useState<Equipment>('Barbell')
  const [primary, setPrimary] = useState<MuscleGroup>('Chest')

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      ui.toast('Give your exercise a name')
      return
    }
    dispatch({
      t: 'addCustomExercise',
      exercise: {
        id: `custom-${uid()}`,
        name: trimmed,
        equipment,
        primary,
        secondary: [],
        category: primary === 'Cardio' ? 'cardio' : 'strength',
        custom: true,
      },
    })
    ui.toast('Custom exercise created')
    ui.pop()
  }

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="x" size={20} />
        </button>
        <h2>Custom Exercise</h2>
        <button className="btn btn-primary btn-sm" onClick={save}>
          Save
        </button>
      </header>

      <div className="form">
        <label className="field">
          <span>Exercise name</span>
          <input
            autoFocus
            placeholder="e.g. Landmine Press"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Equipment</span>
          <div className="chip-row">
            {(['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Band', 'Other'] as Equipment[]).map(
              (eq) => (
                <button
                  key={eq}
                  className={`chip ${equipment === eq ? 'chip-on' : ''}`}
                  onClick={() => setEquipment(eq)}
                >
                  {eq}
                </button>
              )
            )}
          </div>
        </label>

        <label className="field">
          <span>Primary muscle</span>
          <div className="chip-row">
            {MUSCLE_GROUPS.filter((m) => m.id !== 'Full Body').map((m) => (
              <button
                key={m.id}
                className={`chip ${primary === m.id ? 'chip-on' : ''}`}
                onClick={() => setPrimary(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </label>

        <p className="muted small">
          Custom exercises are stored on your device and appear in the exercise library with a
          “custom” tag.
        </p>
      </div>
    </div>
  )
}
