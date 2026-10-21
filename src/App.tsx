import { useEffect, useState } from 'react'
import Landing from './landing/Landing'
import AppShell from './app/AppShell'
import Login from './app/screens/Login'
import SharedPost from './app/screens/SharedPost'
import { StoreProvider } from './lib/store'
import { clearSession, getAccount, migrateLegacy, session as readSession, setSession } from './lib/auth'
import { isDirectLaunch, markLaunched, readLaunchEnv } from './lib/launch'

type Route = { k: 'landing' } | { k: 'app' } | { k: 'shared'; code: string }

function parseHash(): Route {
  const hash = window.location.hash
  if (hash.startsWith('#/app')) return { k: 'app' }
  if (hash.startsWith('#/shared')) {
    const q = hash.slice(hash.indexOf('?') + 1)
    const code = new URLSearchParams(q).get('d') ?? ''
    return { k: 'shared', code }
  }
  if (hash.startsWith('#/landing')) return { k: 'landing' }
  // bare root: installed PWAs, native shells, phones and returning visitors
  // skip the marketing page and boot straight into the tracker.
  // ('#/' and in-page anchors like '#features' stay on the landing.)
  if (hash === '' || hash === '#') {
    if (isDirectLaunch(readLaunchEnv())) return { k: 'app' }
  }
  return { k: 'landing' }
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const fn = () => setRoute(parseHash())
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])

  // stamp every visitor once — returning users never see the landing again
  useEffect(() => {
    markLaunched()
  }, [])

  // bootstrap: existing users keep their data as the guest account and skip
  // the login wall; brand-new visitors meet it.
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const migrated = migrateLegacy()
    const current = readSession()
    if (current) return current
    if (migrated) {
      setSession(migrated)
      return migrated
    }
    return null
  })

  if (route.k === 'shared') return <SharedPost code={route.code} />

  if (route.k === 'app') {
    if (!sessionId) {
      return (
        <div className="app-root">
          <div className="app-frame login-frame">
            <Login onDone={setSessionId} />
          </div>
        </div>
      )
    }
    const account = getAccount(sessionId)
    return (
      <StoreProvider key={sessionId} accountId={sessionId} accountName={account?.name}>
        <AppShell
          onSignOut={() => {
            clearSession()
            setSessionId(null)
          }}
        />
      </StoreProvider>
    )
  }

  return <Landing />
}
