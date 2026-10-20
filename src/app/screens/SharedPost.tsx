import { useMemo, useState } from 'react'
import { session } from '../../lib/auth'
import { codeToPost } from '../../lib/share'
import type { Post } from '../../lib/types'
import { Icon } from '../../components/icons'
import { Avatar } from '../../components/ui'
import { fmtDuration, fmtVolume } from '../../lib/utils'
import { Logo } from '../../components/icons'

/** Public viewer for `#/shared?d=CODE` links — no account needed to look. */
export default function SharedPost({ code }: { code: string }) {
  const post = useMemo<Post | null>(() => codeToPost(code), [code])
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  const add = () => {
    // stash the code; the app consumes it on next open while signed in
    try {
      sessionStorage.setItem('reafit-pending-share', code)
    } catch {
      /* private mode */
    }
    setAdded(true)
  }

  if (!post) {
    return (
      <div className="shared-page">
        <div className="card shared-card">
          <div className="empty-icon">
            <Icon name="info" size={26} />
          </div>
          <h1>This link doesn’t work</h1>
          <p>The share code is missing or damaged. Ask your friend to send a fresh link.</p>
          <a className="btn btn-ghost" href="#/">
            Go to REA Fit
          </a>
        </div>
      </div>
    )
  }

  const unit = 'kg'
  const w = post.workout

  return (
    <div className="shared-page">
      <div className="card shared-card">
        <div className="shared-brand">
          <Logo size={26} />
          <span>REA FIT</span>
        </div>
        <header className="post-head">
          <Avatar name={post.author.name} color={post.author.color} size={42} />
          <div className="post-who">
            <strong>{post.author.name}</strong>
            <span className="muted">@{post.author.handle} shared a workout</span>
          </div>
        </header>
        <h1 className="shared-title">{w.name}</h1>
        <div className="post-stats">
          {w.volumeKg > 0 && (
            <span>
              <Icon name="dumbbell" size={13} /> {fmtVolume(w.volumeKg, unit)} {unit}
            </span>
          )}
          <span>
            <Icon name="clock" size={13} /> {w.durationMin} min
          </span>
          <span>
            <Icon name="chart" size={13} /> {fmtDuration(w.durationMin * 60000)}
          </span>
        </div>
        <div className="shared-exercises">
          {w.exercises.map((e, i) => (
            <div key={i} className="shared-ex">
              <strong>{e.name}</strong>
              <span>
                {e.sets
                  .map((s) => (s.duration > 0 ? `${s.duration}min` : s.weight > 0 ? `${s.weight}kg×${s.reps}` : `${s.reps} reps`))
                  .join(' · ')}
              </span>
            </div>
          ))}
        </div>
        {added ? (
          <div className="shared-added">
            <Icon name="check" size={18} />
            <span>Saved. Open the app to see it in your feed.</span>
          </div>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={add}>
            <Icon name="plus" size={18} /> Add to my feed
          </button>
        )}
        <p className="muted small">
          {added
            ? 'If you’re not signed in yet, the app will ask first — the post waits for you.'
            : 'Free, no account needed to peek. Adding it to a feed uses your local account.'}
        </p>
        {error && <p className="login-error">{error}</p>}
        <a className="link-btn" href="#/">
          Try REA Fit — free forever
        </a>
      </div>
    </div>
  )
}
