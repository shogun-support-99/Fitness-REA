import React from 'react'

export type IconName =
  | 'home'
  | 'dumbbell'
  | 'layers'
  | 'book'
  | 'user'
  | 'users'
  | 'search'
  | 'plus'
  | 'check'
  | 'x'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowUp'
  | 'clock'
  | 'flame'
  | 'trophy'
  | 'heart'
  | 'message'
  | 'upload'
  | 'download'
  | 'sliders'
  | 'trash'
  | 'edit'
  | 'play'
  | 'calendar'
  | 'chart'
  | 'moon'
  | 'sun'
  | 'dots'
  | 'repeat'
  | 'timer'
  | 'zap'
  | 'target'
  | 'monitor'
  | 'watch'
  | 'crown'
  | 'external'
  | 'info'
  | 'note'
  | 'logbook'
  | 'pause'
  | 'skipFwd'

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M7 8v8" />
      <path d="M17 8v8" />
      <path d="M10 12h4" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2V5z" />
      <path d="M8 3v18" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3.5-5 7-5s7 1.5 7 5" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M17 15c3 0 5 1.5 5 4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M4 12l5 5L20 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2.5" />
    </>
  ),
  flame: <path d="M12 2c1.5 4 5.5 5.5 5.5 10a5.5 5.5 0 01-11 0c0-3 2-5 3-6 0 2 1 3 2 3.5C11 7 10.5 4.5 12 2z" />,
  trophy: (
    <>
      <path d="M8 4h8v6a4 4 0 01-8 0V4z" />
      <path d="M8 5H5a3 3 0 003 4" />
      <path d="M16 5h3a3 3 0 01-3 4" />
      <path d="M12 14v3" />
      <path d="M8 21h8" />
      <path d="M10 17h4l1 4H9l1-4z" />
    </>
  ),
  heart: <path d="M12 20.5s-7.5-4.7-9.5-9.2A5.2 5.2 0 0112 7a5.2 5.2 0 019.5 4.3c-2 4.5-9.5 9.2-9.5 9.2z" />,
  message: <path d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.6 0-3-.4-4.3-1.1L3 20l1.1-5.2A8.5 8.5 0 1121 11.5z" />,
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M4 21h16" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h5M13 7h7M4 17h9M17 17h3" />
      <circle cx="11" cy="7" r="2" />
      <circle cx="15" cy="17" r="2" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20l1-4L16 5l3 3L8 19l-4 1z" />
      <path d="M13.5 7.5l3 3" />
    </>
  ),
  play: <path d="M8 5l12 7-12 7V5z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 21h18" />
      <path d="M6 21v-8M11 21V6M16 21v-11M21 21v-5" />
    </>
  ),
  moon: <path d="M20.5 13.5A8.5 8.5 0 1110 3a7 7 0 0010.5 10.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 13v-2a5 5 0 015-5h13" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 11v2a5 5 0 01-5 5H3" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 2h6" />
    </>
  ),
  zap: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  watch: (
    <>
      <rect x="7" y="6" width="10" height="12" rx="3" />
      <path d="M9 6l-.5-4h7L15 6M9 18l-.5 4h7l.5-4" />
    </>
  ),
  crown: <path d="M3 8l4.5 4L12 6l4.5 6L21 8v9H3V8z" />,
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M19 13v6H5V5h6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M12 12v4" />
    </>
  ),
  note: (
    <>
      <path d="M5 4h14v13l-4 4H5V4z" />
      <path d="M15 21v-4h4" />
      <path d="M9 9h6M9 13h4" />
    </>
  ),
  logbook: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  pause: <path d="M9 5v14M15 5v14" />,
  skipFwd: (
    <>
      <path d="M5 5l9 7-9 7V5z" />
      <path d="M18 5v14" />
    </>
  ),
}

export function Icon({
  name,
  size = 22,
  strokeWidth = 2,
  className,
  fill = 'none',
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  fill?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

export function Logo({ size = 30, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#0e0f13" />
      <g stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none">
        <path d="M10 32h4" />
        <path d="M50 32h4" />
        <path d="M16 23v18" />
        <path d="M48 23v18" />
        <path d="M20 32h24" />
      </g>
    </svg>
  )
}

export function Stars({ n = 5, size = 14 }: { n?: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </span>
  )
}
