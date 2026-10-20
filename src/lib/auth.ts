/**
 * Local-first accounts. Everything lives in this browser — no server, no
 * tracking, free forever. Passwords are hashed (SHA-256 + random salt) and
 * never leave the device; each account's data sits under its own key.
 *
 * The storage wrapper falls back to an in-memory map where localStorage is
 * unavailable (SSR, tests), so the module stays importable everywhere.
 */
import type { Account } from './types'
import { uid } from './utils'

const ACCOUNTS_KEY = 'reafit-accounts-v1'
const SESSION_KEY = 'reafit-session-v1'
const DATA_PREFIX = 'reafit-data-'
const LEGACY_KEY = 'reafit-state-v1'
export const GUEST_ID = 'guest'

const mem = new Map<string, string>()
const storage = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k)
    } catch {
      return mem.get(k) ?? null
    }
  },
  set(k: string, v: string): void {
    try {
      localStorage.setItem(k, v)
    } catch {
      mem.set(k, v)
    }
  },
  del(k: string): void {
    try {
      localStorage.removeItem(k)
    } catch {
      mem.delete(k)
    }
  },
}

export const dataKey = (accountId: string) => DATA_PREFIX + accountId

async function sha256(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return 'no-crypto:' + text
  const bytes = new TextEncoder().encode(text)
  const digest = await subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256(salt + ':' + password)
}

const randomSalt = () =>
  Array.from(globalThis.crypto?.getRandomValues?.(new Uint8Array(16)) ?? new Uint8Array(16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('') || uid()

export const AVATAR_COLORS = ['#2f6bff', '#ec4899', '#f59e0b', '#22c55e', '#a855f7', '#06b6d4', '#ef4444']
const colorFor = (seed: string) =>
  AVATAR_COLORS[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

export function listAccounts(): Account[] {
  try {
    return JSON.parse(storage.get(ACCOUNTS_KEY) ?? '[]') as Account[]
  } catch {
    return []
  }
}

export function getAccount(id: string): Account | undefined {
  return listAccounts().find((a) => a.id === id)
}

function saveAccounts(accounts: Account[]) {
  storage.set(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function uniqueHandle(base: string): string {
  const clean = (base.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'athlete').slice(0, 24)
  const handles = new Set(listAccounts().map((a) => a.handle))
  if (!handles.has(clean)) return clean
  let n = 2
  while (handles.has(`${clean}${n}`)) n++
  return `${clean}${n}`
}

export async function createAccount(opts: {
  name: string
  handle?: string
  email?: string
  password?: string
  kind?: 'local' | 'guest'
}): Promise<Account> {
  const kind = opts.kind ?? (opts.password ? 'local' : 'guest')
  const name = opts.name.trim() || 'Athlete'
  const handle = uniqueHandle(opts.handle || name)
  const salt = kind === 'local' ? randomSalt() : ''
  const hash = kind === 'local' && opts.password ? await hashPassword(opts.password, salt) : ''
  const account: Account = {
    id: kind === 'guest' ? GUEST_ID : uid(),
    name,
    handle,
    email: opts.email?.trim() ?? '',
    kind,
    color: colorFor(handle),
    salt,
    hash,
    createdAt: Date.now(),
  }
  saveAccounts([...listAccounts().filter((a) => a.id !== account.id), account])
  return account
}

export async function verifyPassword(account: Account, password: string): Promise<boolean> {
  if (account.kind !== 'local' || !account.hash) return false
  return (await hashPassword(password, account.salt)) === account.hash
}

export async function changePassword(accountId: string, current: string, next: string): Promise<boolean> {
  const accounts = listAccounts()
  const account = accounts.find((a) => a.id === accountId)
  if (!account || account.kind !== 'local') return false
  if (!(await verifyPassword(account, current))) return false
  const salt = randomSalt()
  account.salt = salt
  account.hash = await hashPassword(next, salt)
  saveAccounts(accounts)
  return true
}

export function deleteAccount(id: string) {
  saveAccounts(listAccounts().filter((a) => a.id !== id))
  storage.del(dataKey(id))
  if (session() === id) clearSession()
}

export function findAccountByIdentifier(identifier: string): Account | undefined {
  const id = identifier.trim().toLowerCase()
  return listAccounts().find((a) => a.handle.toLowerCase() === id || (a.email && a.email.toLowerCase() === id))
}

export function session(): string | null {
  const id = storage.get(SESSION_KEY)
  return id && getAccount(id) ? id : null
}

export function setSession(id: string) {
  storage.set(SESSION_KEY, id)
}

export function clearSession() {
  storage.del(SESSION_KEY)
}

/**
 * One-time migration: anyone arriving with data under the legacy key keeps
 * every bit of it as the guest account. Runs on app bootstrap.
 */
export function migrateLegacy(): string | null {
  const legacy = storage.get(LEGACY_KEY)
  const accounts = listAccounts()
  if (!legacy) return null
  if (!accounts.some((a) => a.id === GUEST_ID)) {
    let name = 'Athlete'
    try {
      name = (JSON.parse(legacy) as { settings?: { name?: string } }).settings?.name || 'Athlete'
    } catch {
      /* keep default */
    }
    const guest: Account = {
      id: GUEST_ID,
      name,
      handle: uniqueHandle(name),
      email: '',
      kind: 'guest',
      color: colorFor(name),
      salt: '',
      hash: '',
      createdAt: Date.now(),
    }
    saveAccounts([...accounts, guest])
  }
  if (!storage.get(dataKey(GUEST_ID))) {
    storage.set(dataKey(GUEST_ID), legacy)
  }
  return GUEST_ID
}
