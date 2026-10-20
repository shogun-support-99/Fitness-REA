import React, { useEffect, useRef } from 'react'
import { Icon } from './icons'

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button type="button" className={`chip ${active ? 'chip-on' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

export function Avatar({
  name,
  color,
  size = 36,
}: {
  name: string
  color?: string
  size?: number
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: color ?? 'var(--accent)',
      }}
    >
      {initials}
    </div>
  )
}

export function Sheet({
  title,
  onClose,
  children,
}: {
  title?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="sheet-head">
            <h3>{title}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Confirm({
  title,
  message,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
}: {
  title: string
  message?: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Sheet onClose={onCancel}>
      <div className="confirm">
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ComponentProps<typeof Icon>['name']
  title: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={26} />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`toggle ${on ? 'toggle-on' : ''}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <span className="toggle-knob" />
    </button>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`seg ${value === o.value ? 'seg-on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Small toast hook-free helper: renders via parent */
export function Toast({ msg }: { msg: string | null }) {
  const lastRef = useRef<string | null>(null)
  useEffect(() => {
    lastRef.current = msg
  }, [msg])
  if (!msg) return null
  return <div className="toast" key={msg}>{msg}</div>
}
