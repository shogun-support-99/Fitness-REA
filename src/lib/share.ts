/**
 * Serverless sharing. A post is serialized into a compact URL-safe code so a
 * workout can travel through any messenger: the sender copies a
 * `…/#/shared?d=CODE` link, the recipient opens it and adds the post to their
 * own feed. No server, no accounts in the cloud, nothing to pay for.
 */
import type { Post, PostAuthor, SharedWorkout } from './types'
import { uid } from './utils'

export interface SharedPayload {
  v: 1
  author: Pick<PostAuthor, 'name' | 'handle' | 'color'>
  workout: SharedWorkout
  at: number
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): Uint8Array {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export function encodeShared(author: SharedPayload['author'], workout: SharedWorkout, at = Date.now()): string {
  const payload: SharedPayload = { v: 1, author, workout, at }
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
}

export function decodeShared(code: string): SharedPayload | null {
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(code.trim()))) as SharedPayload
    if (payload?.v !== 1 || !payload?.workout?.name || !Array.isArray(payload.workout.exercises)) return null
    return payload
  } catch {
    return null
  }
}

export function sharedPostLink(code: string): string {
  const { origin, pathname } = globalThis.location ?? { origin: '', pathname: '' }
  return `${origin}${pathname}#/shared?d=${code}`
}

export function postToCode(post: Post): string {
  const { name, handle, color } = post.author
  return encodeShared({ name, handle, color }, post.workout, post.createdAt)
}

export function codeToPost(code: string, fallbackAuthorName = 'Shared athlete'): Post | null {
  const payload = decodeShared(code)
  if (!payload) return null
  const name = payload.author?.name?.trim() || fallbackAuthorName
  const handle = payload.author?.handle?.trim() || name.toLowerCase().replace(/\s+/g, '')
  return {
    id: 'imported-' + uid(),
    author: { name, handle, color: payload.author?.color || '#2f6bff', kind: 'contact' },
    workout: payload.workout,
    createdAt: payload.at || Date.now(),
    likes: 0,
    likedByMe: false,
    comments: [],
  }
}
