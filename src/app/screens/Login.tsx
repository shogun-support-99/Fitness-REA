import { useMemo, useState } from 'react'
import {
  createAccount,
  findAccountByIdentifier,
  getAccount,
  listAccounts,
  setSession,
  upgradeGuestAccount,
  verifyPassword,
} from '../../lib/auth'
import { Logo } from '../../components/icons'
import { Avatar } from '../../components/ui'

type Mode = 'choose' | 'signin' | 'signup'

export default function Login({ onDone }: { onDone: (accountId: string) => void }) {
  const accounts = useMemo(() => listAccounts(), [])
  const [mode, setMode] = useState<Mode>(accounts.length > 0 ? 'choose' : 'signup')
  const [selected, setSelected] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [email, setEmail] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const [identifier, setIdentifier] = useState('')
  const [separate, setSeparate] = useState(false)

  const guestAccount = accounts.find((a) => a.kind === 'guest') ?? null
  // default signup path when guest data exists: convert in place, keep the data
  const upgradePath = !!guestAccount && !separate

  const finish = (accountId: string) => {
    setSession(accountId)
    onDone(accountId)
  }

  const pick = async (accountId: string) => {
    const account = getAccount(accountId)
    if (!account) return
    if (account.kind === 'guest') {
      finish(accountId)
      return
    }
    setSelected(accountId)
    setError('')
  }

  const unlock = async () => {
    if (!selected || busy) return
    const account = getAccount(selected)
    if (!account) return
    setBusy(true)
    setError('')
    const ok = await verifyPassword(account, password)
    setBusy(false)
    if (ok) finish(selected)
    else setError('Wrong password. Try again.')
  }

  const signIn = async () => {
    if (busy) return
    const account = findAccountByIdentifier(identifier)
    if (!account) {
      setError('No account matches that handle or email.')
      return
    }
    if (account.kind === 'guest') {
      finish(account.id)
      return
    }
    setSelected(account.id)
    setMode('choose')
    setPassword('')
    setError('')
  }

  const signUp = async () => {
    if (busy) return
    setError('')
    if (name.trim().length < 2) return setError('Add your name.')
    if (newPw.length < 4) return setError('Password needs at least 4 characters.')
    if (newPw !== confirmPw) return setError('Passwords don’t match.')
    setBusy(true)
    if (upgradePath) {
      // guest -> local, same account id: workouts, routines and feed stay put
      const account = await upgradeGuestAccount({ name, handle: handle || name, email, password: newPw })
      setBusy(false)
      if (account) finish(account.id)
      else setError('Something went wrong — try again.')
      return
    }
    const account = await createAccount({ name, handle: handle || name, email, password: newPw })
    setBusy(false)
    finish(account.id)
  }

  const guest = async () => {
    if (busy) return
    if (guestAccount) {
      finish(guestAccount.id)
      return
    }
    setBusy(true)
    const account = await createAccount({ name: 'Athlete', kind: 'guest' })
    setBusy(false)
    finish(account.id)
  }

  const selectedAccount = selected ? getAccount(selected) : null

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-brand">
          <Logo size={44} />
          <h1>
            REA<span>FIT</span>
          </h1>
          <p>The free workout tracker. No ads. No paywall. Ever.</p>
        </div>

        {mode === 'choose' && !selectedAccount && (
          <>
            <h2 className="login-sub">Welcome back</h2>
            <div className="login-accounts">
              {accounts.map((a) => (
                <button key={a.id} className="card login-account" onClick={() => pick(a.id)}>
                  <Avatar name={a.name} color={a.color} size={38} />
                  <span className="login-account-main">
                    <strong>{a.name}</strong>
                    <span className="muted">@{a.handle}</span>
                  </span>
                  {a.kind === 'guest' && <em className="login-kind">guest</em>}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => setMode('signup')}>
              {guestAccount ? 'Save this account — keep my data' : 'Create a free account'}
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => setMode('signin')}>
              Sign in with another account
            </button>
            {!guestAccount && (
              <button className="link-btn login-alt" onClick={guest}>
                Continue as guest
              </button>
            )}
          </>
        )}

        {mode === 'choose' && selectedAccount && (
          <>
            <h2 className="login-sub">
              Welcome back, {selectedAccount.name.split(' ')[0]}
            </h2>
            <form
              className="login-form"
              onSubmit={(e) => {
                e.preventDefault()
                unlock()
              }}
            >
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Password for @${selectedAccount.handle}`}
                />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button className="btn btn-primary btn-lg" disabled={busy || !password}>
                {busy ? 'Checking…' : 'Sign in'}
              </button>
              <button
                type="button"
                className="link-btn login-alt"
                onClick={() => {
                  setSelected(null)
                  setPassword('')
                  setError('')
                }}
              >
                Choose another account
              </button>
            </form>
          </>
        )}

        {mode === 'signin' && (
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault()
              signIn()
            }}
          >
            <h2 className="login-sub">Sign in</h2>
            <label className="field">
              <span>Handle or email</span>
              <input
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you.gym"
              />
            </label>
            {error && <p className="login-error">{error}</p>}
            <button className="btn btn-primary btn-lg" disabled={!identifier.trim()}>
              Continue
            </button>
            <button type="button" className="link-btn login-alt" onClick={() => setMode('choose')}>
              Back
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault()
              signUp()
            }}
          >
            <h2 className="login-sub">
              {upgradePath ? 'Save this account' : 'Create your free account'}
            </h2>
            {upgradePath && (
              <p className="login-keep">
                You’ve been training as a guest. Add your details and everything — workouts,
                routines, feed — stays exactly where it is.
              </p>
            )}
            {separate && guestAccount && (
              <p className="login-keep">
                Starting fresh. Your guest workouts stay on the guest account — switch back any
                time from this screen.
              </p>
            )}
            <label className="field">
              <span>Name</span>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
            </label>
            <label className="field">
              <span>Handle (optional)</span>
              <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="alex.lifts" />
            </label>
            <label className="field">
              <span>Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 4 characters"
              />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </label>
            {error && <p className="login-error">{error}</p>}
            <button className="btn btn-primary btn-lg" disabled={busy}>
              {busy ? 'Saving…' : upgradePath ? 'Save account — keep my data' : 'Create account'}
            </button>
            {upgradePath ? (
              <button
                type="button"
                className="link-btn login-alt"
                onClick={() => {
                  setSeparate(true)
                  setError('')
                }}
              >
                Create a separate account instead
              </button>
            ) : (
              separate &&
              guestAccount && (
                <button
                  type="button"
                  className="link-btn login-alt"
                  onClick={() => {
                    setSeparate(false)
                    setError('')
                  }}
                >
                  Back to saving my guest account
                </button>
              )
            )}
            {!guestAccount && (
              <button type="button" className="link-btn login-alt" onClick={guest}>
                Skip — continue as guest
              </button>
            )}
          </form>
        )}

        <p className="login-foot">
          Accounts live on this device — your workouts never leave it. Sign in keeps your data
          separate from everyone else who shares the browser.
        </p>
      </div>
    </div>
  )
}
