import React from 'react'

/** Simple responsive bar chart (SVG). */
export function BarChart({
  data,
  height = 150,
  format,
}: {
  data: { label: string; value: number }[]
  height?: number
  format?: (v: number) => string
}) {
  const W = 320
  const H = height
  const pad = { t: 14, r: 4, b: 20, l: 4 }
  const max = Math.max(1, ...data.map((d) => d.value))
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b
  const bw = Math.min(30, (innerW / Math.max(1, data.length)) * 0.62)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Bar chart">
      {data.map((d, i) => {
        const n = data.length
        const cx = pad.l + (innerW / n) * (i + 0.5)
        const h = Math.max(2, (d.value / max) * innerH)
        const y = pad.t + innerH - h
        return (
          <g key={i}>
            <rect
              x={cx - bw / 2}
              y={y}
              width={bw}
              height={h}
              rx={Math.min(5, bw / 2)}
              fill={i === n - 1 ? 'var(--accent)' : 'var(--bar)'}
            />
            {format && i === n - 1 && d.value > 0 && (
              <text x={cx} y={y - 5} textAnchor="middle" className="chart-val">
                {format(d.value)}
              </text>
            )}
            <text x={cx} y={H - 6} textAnchor="middle" className="chart-label">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Simple line chart with dots (SVG). */
export function LineChart({
  points,
  height = 150,
  format,
}: {
  points: { label: string; value: number }[]
  height?: number
  format?: (v: number) => string
}) {
  const W = 320
  const H = height
  const pad = { t: 16, r: 8, b: 20, l: 8 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b
  const max = Math.max(1, ...points.map((p) => p.value))
  const n = points.length
  const x = (i: number) => (n <= 1 ? pad.l + innerW / 2 : pad.l + (innerW / (n - 1)) * i)
  const y = (v: number) => pad.t + innerH - (v / max) * innerH
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const area = `${path} L${x(n - 1).toFixed(1)},${pad.t + innerH} L${x(0).toFixed(1)},${pad.t + innerH} Z`
  const last = points[n - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Line chart">
      <defs>
        <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {n > 1 && <path d={area} fill="url(#lc-area)" stroke="none" />}
      {n > 1 && <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={i === n - 1 ? 4.5 : 3} fill="var(--accent)" />
        </g>
      ))}
      {last && format && (
        <text x={x(n - 1)} y={Math.max(10, y(last.value) - 9)} textAnchor="end" className="chart-val">
          {format(last.value)}
        </text>
      )}
      {points.map((p, i) =>
        i === 0 || i === n - 1 || n <= 8 ? (
          <text key={`l${i}`} x={x(i)} y={H - 6} textAnchor="middle" className="chart-label">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  )
}

/**
 * Radar (spider) chart comparing two periods of muscle distribution.
 * axes: [{ label, a, b }] — a = current period, b = previous.
 */
export function RadarChart({
  axes,
  height = 220,
  labelA = 'Current',
  labelB = 'Previous',
}: {
  axes: { label: string; a: number; b: number }[]
  height?: number
  labelA?: string
  labelB?: string
}) {
  const W = 320
  const H = height
  const cx = W / 2
  const cy = H / 2 + 4
  const R = Math.min(W, H) / 2 - 34
  const n = Math.max(3, axes.length)
  const max = Math.max(1, ...axes.flatMap((d) => [d.a, d.b]))
  const pt = (i: number, v: number) => {
    const ang = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = (v / max) * R
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r] as const
  }
  const poly = (key: 'a' | 'b') =>
    axes.map((d, i) => pt(i, d[key]).join(',')).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart radar-chart" role="img" aria-label="Muscle distribution radar">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={axes.map((_, i) => pt(i, max * f).join(',')).join(' ')}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [px, py] = pt(i, max)
        return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="var(--border)" strokeWidth="1" />
      })}
      <polygon points={poly('b')} fill="rgba(142,142,147,0.18)" stroke="var(--text2)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={poly('a')} fill="rgba(10,132,255,0.22)" stroke="var(--accent)" strokeWidth="2" />
      {axes.map((d, i) => {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2
        const lx = cx + Math.cos(ang) * (R + 18)
        const ly = cy + Math.sin(ang) * (R + 18)
        return (
          <text
            key={d.label}
            x={lx}
            y={ly + 3}
            textAnchor={Math.abs(Math.cos(ang)) < 0.3 ? 'middle' : Math.cos(ang) > 0 ? 'start' : 'end'}
            className="chart-label"
          >
            {d.label}
          </text>
        )
      })}
      <g className="radar-legend">
        <circle cx={cx - 52} cy={10} r="4" fill="var(--accent)" />
        <text x={cx - 44} y={13} className="chart-label">{labelA}</text>
        <circle cx={cx + 8} cy={10} r="4" fill="var(--text2)" />
        <text x={cx + 16} y={13} className="chart-label">{labelB}</text>
      </g>
    </svg>
  )
}
