import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useUI } from '../uiContext'
import { Icon } from '../../components/icons'
import { Avatar } from '../../components/ui'
import type { Post } from '../../lib/types'
import { fmtDuration, fmtVolume, timeAgo, workoutVolume } from '../../lib/utils'

export default function FeedTab() {
  const { state, dispatch, posts, getExercise } = useStore()
  const ui = useUI()
  const unit = state.settings.unit

  const userPosts: Post[] = state.workouts.slice(0, 3).map((w, idx) => {
    const muscles = [...new Set(w.exercises.map((e) => getExercise(e.exerciseId)?.primary).filter(Boolean))] as string[]
    return {
      id: `own-${w.id}`,
      athlete: state.settings.name,
      handle: 'you',
      color: 'var(--accent)',
      time: w.start,
      workoutName: w.name,
      muscles,
      volume: workoutVolume(w),
      durationMin: Math.round((w.end - w.start) / 60000),
      exercises: w.exercises.slice(0, 4).map((e) => getExercise(e.exerciseId)?.name ?? 'Exercise'),
      likes: 0,
    }
  })

  const allPosts = [...userPosts, ...posts]

  return (
    <div className="tab-screen">
      <header className="page-head">
        <h1>Feed</h1>
      </header>

      <div className="feed-list">
        {allPosts.map((p) => (
          <PostCard key={p.id} post={p} unit={unit} />
        ))}
      </div>

      <p className="muted small feed-note">
        Demo feed — like, comment and follow to try the social side of REA Fit.
      </p>
    </div>
  )
}

function PostCard({ post, unit }: { post: Post; unit: 'kg' | 'lb' }) {
  const { state, dispatch } = useStore()
  const [openComments, setOpenComments] = useState(false)
  const [draft, setDraft] = useState('')
  const liked = state.liked.includes(post.id)
  const comments = state.comments[post.id] ?? []
  const following = state.followed.includes(post.handle)
  const isYou = post.handle === 'you'

  return (
    <article className="card post">
      <header className="post-head">
        <Avatar name={post.athlete} color={post.color} size={38} />
        <div className="post-who">
          <strong>{isYou ? 'You' : post.athlete}</strong>
          <span className="muted">
            @{post.handle} · {timeAgo(post.time)}
          </span>
        </div>
        {!isYou && (
          <button
            className={`btn btn-sm ${following ? 'btn-ghost' : 'btn-follow'}`}
            onClick={() => dispatch({ t: 'toggleFollow', handle: post.handle })}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </header>

      <h3 className="post-title">{post.workoutName}</h3>

      <div className="chip-row">
        {post.muscles.slice(0, 4).map((m) => (
          <span key={m} className="chip chip-static">
            {m}
          </span>
        ))}
      </div>

      <p className="post-exercises">{post.exercises.join(' · ')}</p>

      <div className="post-stats">
        {post.volume > 0 && (
          <span>
            <Icon name="dumbbell" size={13} /> {fmtVolume(post.volume, unit)} {unit}
          </span>
        )}
        <span>
          <Icon name="clock" size={13} /> {post.durationMin} min
        </span>
        <span>
          <Icon name="chart" size={13} /> {fmtDuration(post.durationMin * 60000)}
        </span>
      </div>

      <footer className="post-actions">
        <button
          className={`post-action ${liked ? 'post-action-liked' : ''}`}
          onClick={() => dispatch({ t: 'toggleLike', id: post.id })}
        >
          <Icon name="heart" size={18} fill={liked ? 'currentColor' : 'none'} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button className="post-action" onClick={() => setOpenComments((o) => !o)}>
          <Icon name="message" size={18} />
          {comments.length}
        </button>
      </footer>

      {openComments && (
        <div className="post-comments">
          {comments.map((c, i) => (
            <div key={i} className="comment">
              <strong>You</strong> {c}
            </div>
          ))}
          <form
            className="comment-form"
            onSubmit={(e) => {
              e.preventDefault()
              const text = draft.trim()
              if (!text) return
              dispatch({ t: 'addComment', id: post.id, text })
              setDraft('')
            }}
          >
            <input
              placeholder="Add a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
