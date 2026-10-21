/**
 * Auth integration tests — exercises the account layer end to end with a
 * localStorage shim: signup, sign-in, guest flow, legacy migration, and the
 * logout/login lifecycle. Run via `npm run test:auth`.
 */

// ---- in-memory localStorage shim (must exist before importing auth) ----
const store = new Map<string, string>()
;(globalThis as any).localStorage = {
  getItem(k: string) {
    return store.get(k) ?? null
  },
  setItem(k: string, v: string) {
    store.set(k, String(v))
  },
  removeItem(k: string) {
    store.delete(k)
  },
  clear() {
    store.clear()
  },
}

import {
  clearSession,
  createAccount,
  findAccountByIdentifier,
  getAccount,
  listAccounts,
  migrateLegacy,
  session,
  setSession,
  upgradeGuestAccount,
  verifyPassword,
  dataKey,
  GUEST_ID,
} from '../src/lib/auth'

let passed = 0
let failed = 0
function check(name: string, ok: boolean) {
  if (ok) {
    passed++
    console.log('OK  ', name)
  } else {
    failed++
    console.log('FAIL', name)
  }
}

async function main() {
// ---------- signup ----------
const alex = await createAccount({ name: 'Alex Kim', handle: 'alex.kim', email: 'alex@mail.com', password: 'secret1' })
check('signup creates local account', alex.kind === 'local' && !!alex.id)
check('account persisted', listAccounts().some((a) => a.id === alex.id))
check('password verifies', await verifyPassword(getAccount(alex.id)!, 'secret1'))
check('wrong password rejected', !(await verifyPassword(getAccount(alex.id)!, 'wrong')))
check('handle normalized', alex.handle === 'alex.kim')

// duplicate handle gets a unique suffix
const alex2 = await createAccount({ name: 'Alex Two', handle: 'alex.kim', password: 'pass1234' })
check('duplicate handle made unique', alex2.handle !== 'alex.kim')

// ---------- identifier sign-in ----------
check('find by handle', findAccountByIdentifier('alex.kim')?.id === alex.id)
check('find by email', findAccountByIdentifier('alex@mail.com')?.id === alex.id)
check('unknown identifier returns undefined', findAccountByIdentifier('nobody') === undefined)

// ---------- session lifecycle ----------
setSession(alex.id)
check('session set', session() === alex.id)
clearSession()
check('session cleared', session() === null)
setSession('deleted-account')
check('session for missing account is null', session() === null)

// ---------- per-account data separation ----------
store.set(dataKey(alex.id), JSON.stringify({ workouts: [{ id: 'w-a' }] }))
const sam = await createAccount({ name: 'Sam', password: 'pass1234' })
store.set(dataKey(sam.id), JSON.stringify({ workouts: [{ id: 'w-b' }] }))
check('data keys are per-account', dataKey(alex.id) !== dataKey(sam.id))

// ---------- guest flow ----------
const guest1 = await createAccount({ name: 'Athlete', kind: 'guest' })
check('guest uses stable id', guest1.id === GUEST_ID)
const guestAgain = await createAccount({ name: 'Athlete', kind: 'guest' })
check('guest is not duplicated', listAccounts().filter((a) => a.kind === 'guest').length === 1)
check('re-created guest keeps same id', guestAgain.id === GUEST_ID)

// ---------- legacy migration (the logout bug) ----------
store.clear()
store.set('reafit-state-v1', JSON.stringify({ settings: { name: 'Shogun' }, workouts: [{ id: 'w1' }] }))

// first open: migrate + auto session
const first = migrateLegacy()
check('first open migrates to guest', first === GUEST_ID)
check('legacy data copied to guest key', store.get(dataKey(GUEST_ID))?.includes('w1') === true)
check('legacy key removed after migration', !store.has('reafit-state-v1'))

// user logs out, reloads: login must NOT be bypassed
clearSession()
const second = migrateLegacy()
check('reload after logout does NOT force guest session', second === null)
check('guest account still listed for one-tap return', listAccounts().some((a) => a.id === GUEST_ID))

// strict-mode double invoke is harmless
store.set('reafit-state-v1', JSON.stringify({ settings: { name: 'X' }, workouts: [] }))
migrateLegacy()
const third = migrateLegacy()
check('double migration is idempotent', third === null || listAccounts().filter((a) => a.id === GUEST_ID).length === 1)

// ---------- guest upgrade: signup keeps the data ----------
store.clear()
store.set('reafit-state-v1', JSON.stringify({ settings: { name: 'Shogun' }, workouts: [{ id: 'w-legacy' }] }))
migrateLegacy()
const upgraded = await upgradeGuestAccount({ name: 'Shogun Rao', handle: 'shogun.rao', email: 's@x.com', password: 'strong1' })
check('upgrade converts guest in place', upgraded.id === GUEST_ID && upgraded.kind === 'local')
check('upgraded account keeps its data', store.get(dataKey(GUEST_ID))?.includes('w-legacy') === true)
check('upgraded account verifies password', await verifyPassword(upgraded, 'strong1'))
check('no second account created', listAccounts().length === 1)

// upgrade is guarded: upgrading when no guest exists returns null
store.clear()
const none = await upgradeGuestAccount({ name: 'Ghost', password: 'x1234' })
check('upgrade without guest returns null', none === null)

}

main().then(() => {
  console.log(failed === 0 ? `\nALL AUTH TESTS PASSED (${passed})` : `\n${failed} FAILURES (${passed} passed)`)
  if (failed > 0) process.exit(1)
})
