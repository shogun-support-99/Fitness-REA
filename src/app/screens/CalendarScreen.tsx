import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Sheet } from '../../components/ui'
import { dayKey, dayStart, restDays, weekStreak } from '../../lib/utils'
import type { Workout } from '../../lib/types'

const DAY = 86400000
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** A month grid: title + Sunday-first weeks with workout dots. */
function MonthBlock({
  year,
  month,
  byDay,
  todayKey,
  onPickDay,
}: {
  year: number
  month: number
  byDay: Map<string, Workout[]>
  todayKey: string
  onPickDay: (ws: Workout[]) => void
}) {
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <section className="cal-month">
      <h3 className="cal-month-title">
        {MONTHS[month]} {year}
      </h3>
      <div className="cal-grid">
        {weeks.map((week, wi) => (
          <div className="cal-week" key={wi}>
            {week.map((d, di) => {
              if (d === null) return <span className="cal-day cal-day-empty" key={di} />
              const ts = new Date(year, month, d, 12).getTime()
              const key = dayKey(ts)
              const ws = byDay.get(key)
              const isToday = key === todayKey
              const isFuture = ts > Date.now()
              return (
                <button
                  className={`cal-day ${ws ? 'cal-day-has' : ''} ${isToday ? 'cal-day-today' : ''} ${
                    isFuture ? 'cal-day-future' : ''
                  }`}
                  key={di}
                  onClick={() => ws && onPickDay(ws)}
                  aria-label={`${MONTHS[month]} ${d}${ws ? ` — ${ws.length} workout${ws.length === 1 ? '' : 's'}` : ''}`}
                >
                  <span className="cal-num">{d}</span>
                  {ws && <i className="cal-dot" />}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function CalendarScreen() {
  const { state } = useStore()
  const ui = useUI()
  const { workouts } = state

  const [jumpOpen, setJumpOpen] = useState(false)
  const [anchor, setAnchor] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [daySheet, setDaySheet] = useState<Workout[] | null>(null)

  const todayKey = dayKey(Date.now())

  const byDay = useMemo(() => {
    const map = new Map<string, Workout[]>()
    for (const w of workouts) {
      const k = dayKey(w.start)
      map.set(k, [...(map.get(k) ?? []), w])
    }
    return map
  }, [workouts])

  const streak = weekStreak(workouts)
  const rest = restDays(workouts)

  // three months ending at the anchor
  const months = useMemo(() => {
    const out: { y: number; m: number }[] = []
    let { y, m } = anchor
    for (let i = 0; i < 3; i++) {
      out.unshift({ y, m })
      m -= 1
      if (m < 0) {
        m = 11
        y -= 1
      }
    }
    return out
  }, [anchor])

  // last 12 months for the jump sheet
  const jumpList = useMemo(() => {
    const out: { y: number; m: number }[] = []
    const d = new Date()
    for (let i = 0; i < 12; i++) {
      out.push({ y: d.getFullYear(), m: d.getMonth() })
      d.setMonth(d.getMonth() - 1)
    }
    return out
  }, [])

  const shareSummary = () => {
    const text = `REA Fit — ${workouts.length} workouts · ${streak} week streak · ${rest} rest days`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => ui.toast('Summary copied'),
        () => ui.toast(text)
      )
    } else {
      ui.toast(text)
    }
  }

  return (
    <div className="subscreen cal-screen">
      <header className="sub-head">
        <button className="icon-btn" onClick={() => ui.pop()} aria-label="Back">
          <Icon name="arrowLeft" size={22} />
        </button>
        <button className="cal-title-btn" onClick={() => setJumpOpen(true)}>
          <h2>Month</h2>
          <Icon name="chevronDown" size={16} />
        </button>
        <button className="icon-btn" aria-label="Share summary" onClick={shareSummary}>
          <Icon name="share" size={20} />
        </button>
      </header>

      <div className="cal-banner">
        <div className="cal-banner-cell">
          <Icon name="flame" size={18} className="cal-flame" />
          <span>
            {streak} week streak
          </span>
        </div>
        <div className="cal-banner-cell">
          <Icon name="moon" size={16} className="cal-moon" />
          <span>{rest} rest days</span>
        </div>
      </div>

      <div className="cal-weekdays">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="cal-body">
        {months.map(({ y, m }) => (
          <MonthBlock
            key={`${y}-${m}`}
            year={y}
            month={m}
            byDay={byDay}
            todayKey={todayKey}
            onPickDay={(ws) => (ws.length === 1 ? ui.push({ k: 'workout', id: ws[0].id }) : setDaySheet(ws))}
          />
        ))}
      </div>

      {jumpOpen && (
        <Sheet title="Jump to month" onClose={() => setJumpOpen(false)}>
          <div className="sheet-actions">
            {jumpList.map(({ y, m }) => (
              <button
                key={`${y}-${m}`}
                className={`btn btn-ghost btn-lg ${y === anchor.y && m === anchor.m ? 'btn-primary' : ''}`}
                onClick={() => {
                  setAnchor({ y, m })
                  setJumpOpen(false)
                }}
              >
                {MONTHS[m]} {y}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {daySheet && (
        <Sheet title="Workouts this day" onClose={() => setDaySheet(null)}>
          <div className="sheet-actions">
            {daySheet.map((w) => (
              <button
                key={w.id}
                className="btn btn-ghost btn-lg"
                onClick={() => {
                  const id = w.id
                  setDaySheet(null)
                  ui.push({ k: 'workout', id })
                }}
              >
                <Icon name="dumbbell" size={16} /> {w.name}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}
