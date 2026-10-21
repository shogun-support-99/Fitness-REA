import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Avatar, Sheet } from '../../components/ui'
import type { Post } from '../../lib/types'
import { postToCode, sharedPostLink } from '../../lib/share'
import { fmtVolume, timeAgo } from '../../lib/utils'

export default function FeedTab() {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const [shareOpen, setShareOpen] = useState(false)
  const unit = state.settings.unit

  const posts = useMemo(() => [...state.posts].sort((a, b) => b.createdAt - a.createdAt), [state.posts])
  const shareable = state.workouts.slice(0, 10)

  const share = (workoutId: string) => {
    dispatch({ t: 'shareWorkout', workoutId })
    setShareOpen(false)
    ui.toast('Shared to your feed')
  }

  return (
    <div className="tab-screen">
      <header className="page-head">
        <h1>Feed</h1>
        <div className="head-actions">
          <button className="icon-btn" aria-label="Contacts" onClick={() => ui.push({ k: 'contacts' })}>
            <Icon name="users" size={20} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShareOpen(true)}>
            <Icon name="upload" size={15} /> Share
          </button>
        </div>
      </header>

      {shareOpen && (
        <Sheet title="Share a workout" onClose={() => setShareOpen(false)}>
          {shareable.length === 0 ? (
            <p className="muted">Finish a workout first — then it shows up here.</p>
          ) : (
            <div className="list">
              {shareable.map((w) => (
                <button key={w.id} className="card row-item" onClick={() => share(w.id)}>
                  <div className="row-icon">
                    <Icon name="dumbbell" size={18} />
                  </div>
                  <div className="row-main">
                    <strong>{w.name}</strong>
                    <span>
                      {timeAgo(w.start)} · {w.exercises.length} exercises
                    </span>
                  </div>
                  <Icon name="chevronRight" size={16} className="row-chevron" />
                </button>
              ))}
            </div>
          )}
        </Sheet>
      )}

      <div className="feed-list">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} unit={unit} />
        ))}
      </div>

      <p className="muted small feed-note">
        Your shares, your contacts and the athletes you follow. Share a workout, copy the link,
        send it to a friend — it lands in their feed when they open it.
      </p>
    </div>
  )
}

function PostCard({ post, unit }: { post: Post; unit: 'kg' | 'lb' }) {
  const { state, dispatch } = useStore()
  const ui = useUI()
  const [openComments, setOpenComments] = useState(false)
  const [draft, setDraft] = useState('')
  const w = post.workout
  const isMe = post.author.kind === 'me'
  const isAthlete = post.author.kind === 'athlete'
  const contact = state.contacts.find((c) => c.handle === post.author.handle)
  const following = isAthlete
    ? state.followedHandles.includes(post.author.handle)
    : contact?.followed ?? false

  const sharePost = () => {
    const link = sharedPostLink(postToCode(post))
    const done = () => ui.toast('Share link copied')
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(done, () => ui.toast(link))
    } else {
      ui.toast(link)
    }
  }

  return (
    <article className="card post">
      <header className="post-head">
        <Avatar name={post.author.name} color={post.author.color} size={38} />
        <div className="post-who">
          <strong>
            {isMe ? 'You' : post.author.name}
            {isAthlete && <em className="post-kind">athlete</em>}
          </strong>
          <span className="muted">
            @{post.author.handle} · {timeAgo(post.createdAt)}
          </span>
        </div>
        {!isMe && (isAthlete || contact) && (
          <button
            className={`btn btn-sm ${following ? 'btn-ghost' : 'btn-follow'}`}
            onClick={() =>
              isAthlete
                ? dispatch({ t: 'toggleFollowHandle', handle: post.author.handle })
                : dispatch({ t: 'toggleContactFollow', id: contact!.id })
            }
          >
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </header>

      <h3 className="post-title">{w.name}</h3>

      <p className="post-exercises">{w.exercises.map((e) => e.name).join(' · ')}</p>

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
          <Icon name="chart" size={13} /> {w.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
        </span>
      </div>

      <details className="post-sets">
        <summary>See the workout</summary>
        {w.exercises.map((e, i) => (
          <div key={i} className="shared-ex">
            <strong>{e.name}</strong>
            <span>
              {e.sets
                .map((s) =>
                  s.duration > 0
                    ? `${s.duration}min${s.distance ? ` ${s.distance}km` : ''}`
                    : s.weight > 0
                      ? `${s.weight}kg×${s.reps}`
                      : `${s.reps} reps`
                )
                .join(' · ')}
            </span>
          </div>
        ))}
      </details>

      <footer className="post-actions">
        <button
          className={`post-action ${post.likedByMe ? 'post-action-liked' : ''}`}
          onClick={() => dispatch({ t: 'likePost', id: post.id })}
        >
          <Icon name="heart" size={18} fill={post.likedByMe ? 'currentColor' : 'none'} />
          {post.likes}
        </button>
        <button className="post-action" onClick={() => setOpenComments((o) => !o)}>
          <Icon name="message" size={18} />
          {post.comments.length}
        </button>
        <button className="post-action" onClick={sharePost} aria-label="Copy share link">
          <Icon name="external" size={18} />
        </button>
        {isMe && (
          <button
            className="post-action post-action-danger"
            aria-label="Delete post"
            onClick={() => dispatch({ t: 'deletePost', id: post.id })}
          >
            <Icon name="trash" size={18} />
          </button>
        )}
      </footer>

      {openComments && (
        <div className="post-comments">
          {post.comments.map((c, i) => (
            <div key={i} className="comment">
              <strong>{c.name}</strong> {c.text}
            </div>
          ))}
          <form
            className="comment-form"
            onSubmit={(e) => {
              e.preventDefault()
              const text = draft.trim()
              if (!text) return
              dispatch({ t: 'commentPost', id: post.id, text })
              setDraft('')
            }}
          >
            <input placeholder="Add a comment…" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
