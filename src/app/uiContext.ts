import { createContext, useContext } from 'react'

/** Hevy-style 3-tab shell: Home, Workout, Profile. */
export type Tab = 'home' | 'workout' | 'profile'

export type Screen =
  | { k: 'logger' }
  | { k: 'picker'; onPick: (ids: string[]) => void }
  | { k: 'customExercise' }
  | { k: 'exercise'; id: string }
  | { k: 'workout'; id: string }
  | { k: 'routine'; id: string }
  | { k: 'routineEditor'; id?: string }
  | { k: 'history' }
  | { k: 'contacts' }
  | { k: 'bodyDist' }
  | { k: 'settings' }
  | { k: 'measurements' }
  | { k: 'calendar' }
  | { k: 'exercises' }
  | { k: 'feed' }

export interface UIApi {
  push: (s: Screen) => void
  pop: () => void
  resetTo: (t: Tab) => void
  toast: (msg: string) => void
  startRest: (sec: number) => void
  adjustRest: (sec: number) => void
  stopRest: () => void
  /** local accounts: sign out and switch user */
  logout: () => void
  switchAccount: () => void
}

export const UICtx = createContext<UIApi | null>(null)

export function useUI(): UIApi {
  const ctx = useContext(UICtx)
  if (!ctx) throw new Error('useUI must be used inside AppShell')
  return ctx
}
