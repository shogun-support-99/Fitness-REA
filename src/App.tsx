import { useEffect, useState } from 'react'
import Landing from './landing/Landing'
import AppShell from './app/AppShell'

export default function App() {
  const [route, setRoute] = useState<'landing' | 'app'>(() =>
    window.location.hash.startsWith('#/app') ? 'app' : 'landing'
  )

  useEffect(() => {
    const fn = () =>
      setRoute(window.location.hash.startsWith('#/app') ? 'app' : 'landing')
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])

  return route === 'app' ? <AppShell /> : <Landing />
}
