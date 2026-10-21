/**
 * Launch routing: decide whether a visit should skip the marketing landing
 * page and boot straight into the tracker.
 *
 * Bypasses the landing for: installed PWAs (display-mode: standalone),
 * iOS home-screen apps (navigator.standalone), Capacitor native shells,
 * phone-sized viewports, and returning visitors (reafit_launched flag).
 */

export const LAUNCHED_FLAG = 'reafit_launched'

/** Launch-environment signals (injectable so the decision is testable). */
export interface LaunchEnv {
  standalone: boolean
  iosStandalone: boolean
  capacitor: boolean
  viewportWidth: number
  launchedBefore: boolean
}

/** True when this launch should go straight into the app. */
export function isDirectLaunch(env: LaunchEnv): boolean {
  return (
    env.standalone ||
    env.iosStandalone ||
    env.capacitor ||
    env.viewportWidth <= 768 ||
    env.launchedBefore
  )
}

/** Reads the real browser environment; every probe is private-mode safe. */
export function readLaunchEnv(): LaunchEnv {
  const env: LaunchEnv = {
    standalone: false,
    iosStandalone: false,
    capacitor: false,
    viewportWidth: 1024,
    launchedBefore: false,
  }
  try {
    env.standalone = window.matchMedia('(display-mode: standalone)').matches
  } catch {
    /* no matchMedia */
  }
  try {
    env.iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true
  } catch {
    /* not iOS */
  }
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor
    env.capacitor = !!cap?.isNativePlatform?.()
  } catch {
    /* no Capacitor */
  }
  try {
    env.viewportWidth = window.innerWidth
  } catch {
    /* no window (SSR) */
  }
  try {
    env.launchedBefore = localStorage.getItem(LAUNCHED_FLAG) === 'true'
  } catch {
    /* private mode */
  }
  return env
}

/** Stamp the visitor so they never see the landing page again. */
export function markLaunched(): void {
  try {
    localStorage.setItem(LAUNCHED_FLAG, 'true')
  } catch {
    /* private mode */
  }
}
