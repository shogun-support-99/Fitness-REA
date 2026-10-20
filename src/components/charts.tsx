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
