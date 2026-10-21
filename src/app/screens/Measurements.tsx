import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Confirm, Sheet } from '../../components/ui'
import { LineChart } from '../../components/charts'
import { toDisplayVal, toKg, fmtNum, fmtWeight, dayStart } from '../../lib/utils'
import type { Measurement } from '../../lib/types'

type Range = 1 | 3 | 6 | 0
const RANGES: { value: Range; label: string }[] = [
  { value: 1, label: 'Last month' },
  { value: 3, label: 'Last 3 months' },
  { value: 6, label: 'Last 6 months' },
  { value: 0, label: 'All time' },
]
const DAY = 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Measurements() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const unit = state.settings.unit
  const [range, setRange] = useState<Range>(3)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [kgDraft, setKgDraft] = useState('')
  const [menuM, setMenuM] = useState<Measurement | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)

  const sorted = useMemo(
    () => [...state.measurements].sort((a, b) => a.at - b.at),
    [state.measurements]
  )
  const visible = useMemo(() => {
    if (range === 0) return sorted
    const from = dayStart(Date.now()) - range * 30 * DAY
    return sorted.filter((m) => m.at >= from)
  }, [sorted, range])

  const latest = sorted[sorted.length - 1]
  const first = sorted[0]
  const delta = latest && first && sorted.length > 1 ? latest.kg - first.kg : 0

  const add = () => {
    const v = parseFloat(kgDraft.replace(',', '.'))
    if (!Number.isFinite(v) || v <= 0) {
      ui.toast('Enter your weight first')
      return
    }
    dispatch({ t: 'addMeasurement', kg: toKg(v, unit), at: Date.now() })
    setKgDraft('')
    setAddOpen(false)
    ui.toast('Measurement saved')
  }

  return (
    <div className="subscreen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="arrowLeft" size={22} />
        </button>
        <h2>Measurements</h2>
        <button className="icon-btn" aria-label="Add measurement" onClick={() => setAddOpen(true)}>
          <Icon name="plus" size={22} />
        </button>
      </header>

      <div className="ms-body">
        <div className="ms-range-row">
          <button className="hv-range-btn" onClick={() => setRangeOpen(true)}>
            {RANGES.find((r) => r.value === range)?.label} <Icon name="chevronDown" size={16} />
          </button>
        </div>

        <div className="hv-chart-card">
          {visible.length >= 2 ? (
            <LineChart
              height={150}
              points={visible.map((m) => ({
                label: `${MONTHS[new Date(m.at).getMonth()]} ${new Date(m.at).getDate()}`,
                value: toDisplayVal(m.kg, unit),
              }))}
              format={(v) => `${fmtNum(v)} ${unit}`}
            />
          ) : (
            <div className="hv-chart-empty">
              <Icon name="bars" size={42} />
              <p>{visible.length === 1 ? 'Add more entries to see a trend' : 'No data in time period'}</p>
            </div>
          )}
        </div>

        {latest && (
          <div className="ms-current">
            <div>
              <span className="muted small">Current weight</span>
              <strong>
                {fmtWeight(latest.kg, unit)} {unit}
              </strong>
            </div>
            {sorted.length > 1 && (
              <div className={`ms-delta ${delta <= 0 ? 'ms-delta-down' : 'ms-delta-up'}`}>
                <Icon name="arrowUp" size={14} className={delta <= 0 ? 'ms-flip' : ''} />
                {fmtNum(Math.abs(toDisplayVal(delta, unit)))} {unit}
                <span className="muted small"> since first entry</span>
              </div>
            )}
          </div>
        )}

        <p className="hv-section-label">Weight History</p>
        <div className="ms-history">
          {[...visible].reverse().map((m) => (
            <button className="ms-row" key={m.id} onClick={() => setMenuM(m)}>
              <span className="ms-date">
                {MONTHS[new Date(m.at).getMonth()]} {new Date(m.at).getDate()}
              </span>
              <span className="ms-weight">
                {fmtWeight(m.kg, unit)} {unit}
              </span>
            </button>
          ))}
          {visible.length === 0 && (
            <p className="muted small ms-empty">
              No measurements yet — tap + to log your weight. It stays on this device.
            </p>
          )}
        </div>
      </div>

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

      {addOpen && (
        <Sheet title="Add measurement" onClose={() => setAddOpen(false)}>
          <label className="sheet-label" htmlFor="ms-weight">
            Body weight ({unit})
          </label>
          <input
            id="ms-weight"
            className="sheet-input"
            type="text"
            inputMode="decimal"
            value={kgDraft}
            onChange={(e) => setKgDraft(e.target.value)}
            placeholder={latest ? fmtNum(toDisplayVal(latest.kg, unit)) : '70'}
          />
          <button className="btn btn-primary btn-lg" onClick={add}>
            Save measurement
          </button>
        </Sheet>
      )}

      {menuM && !confirmDel && (
        <Sheet title="Measurement" onClose={() => setMenuM(null)}>
          <p className="muted small">
            {new Date(menuM.at).toDateString()} · {fmtWeight(menuM.kg, unit)} {unit}
          </p>
          <div className="sheet-actions">
            <button
              className="btn btn-ghost btn-lg btn-danger-ghost"
              onClick={() => setConfirmDel(true)}
            >
              <Icon name="trash" size={16} /> Delete entry
            </button>
          </div>
        </Sheet>
      )}

      {confirmDel && menuM && (
        <Confirm
          title="Delete entry?"
          message="This measurement will be removed from this device."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            dispatch({ t: 'deleteMeasurement', id: menuM.id })
            setConfirmDel(false)
            setMenuM(null)
            ui.toast('Entry deleted')
          }}
          onCancel={() => setConfirmDel(false)}
        />
      )}
    </div>
  )
}
