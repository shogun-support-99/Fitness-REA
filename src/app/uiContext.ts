import { createContext, useContext } from 'react'

export type Tab = 'home' | 'routines' | 'exercises' | 'feed' | 'profile'

export type Screen =
  | { k: 'logger' }
  | { k: 'picker'; onPick: (ids: string[]) => void }
  | { k: 'customExercise' }
  | { k: 'exercise'; id: string }
  | { k: 'workout'; id: string }
  | { k: 'routine'; id: string }
  | { k: 'routineEditor'; id?: string }
  | { k: 'history' }

export interface UIApi {
  push: (s: Screen) => void
  pop: () => void
  resetTo: (t: Tab) => void
  toast: (msg: string) => void
  startRest: (sec: number) => void
  adjustRest: (sec: number) => void
  stopRest: () => void
  /** full exercise library chunk: loading right now, ready, or failed to fetch */
  datasetStatus: 'loading' | 'ready' | 'error'
  retryDataset: () => void
}

export const UICtx = createContext<UIApi | null>(null)

export function useUI(): UIApi {
  const ctx = useContext(UICtx)
  if (!ctx) throw new Error('useUI must be used inside AppShell')
  return ctx
}
