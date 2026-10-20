import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { AppState, Exercise, Routine, Settings, Workout } from './types'
import { EXERCISES } from '../data/exercises'
import { uid } from './utils'
import { samplePosts, sampleRoutines, sampleWorkouts } from './seed'

const KEY = 'reafit-state-v1'

const DEFAULT_SETTINGS: Settings = {
  name: 'Athlete',
  unit: 'kg',
  theme: 'dark',
  defaultRest: 90,
  restAutoStart: true,
  sound: true,
}

export function freshState(): AppState {
  return {
    active: null,
    workouts: [],
    routines: [],
    customs: [],
    settings: { ...DEFAULT_SETTINGS },
    liked: [],
    comments: {},
    followed: [],
    sampleLoaded: false,
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...freshState(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    }
  } catch {
    return freshState()
  }
}

export type Action =
  | { t: 'startWorkout'; routineId?: string; exerciseId?: string }
  | { t: 'startAgain'; workoutId: string }
  | { t: 'updateActive'; workout: Workout }
  | { t: 'discardActive' }
  | { t: 'finishActive' }
  | { t: 'deleteWorkout'; id: string }
  | { t: 'saveRoutine'; routine: Routine }
  | { t: 'deleteRoutine'; id: string }
  | { t: 'addCustomExercise'; exercise: Exercise }
  | { t: 'deleteCustomExercise'; id: string }
  | { t: 'settings'; patch: Partial<Settings> }
  | { t: 'loadSample' }
  | { t: 'clearAll' }
  | { t: 'importData'; state: AppState }
  | { t: 'toggleLike'; id: string }
  | { t: 'addComment'; id: string; text: string }
  | { t: 'toggleFollow'; handle: string }

export function reducer(state: AppState, action: Action): AppState {
  switch (action.t) {
    case 'startWorkout': {
      const routine = action.routineId
        ? state.routines.find((r) => r.id === action.routineId)
        : undefined
      const active: Workout = {
        id: uid(),
        name: routine ? routine.name : `Workout ${state.workouts.length + 1}`,
        start: Date.now(),
        end: 0,
        exercises: routine
          ? routine.exercises.map((re) => ({
              exerciseId: re.exerciseId,
              notes: re.notes ?? '',
              sets: re.sets.map((rs) => ({
                type: rs.type,
                weight: rs.weight,
                reps: rs.reps,
                duration: rs.duration,
                distance: rs.distance,
                done: false,
              })),
            }))
          : [],
      }
      if (action.exerciseId) {
        active.exercises.push({
          exerciseId: action.exerciseId,
          notes: '',
          sets: [{ type: 'normal', weight: 0, reps: 0, duration: 0, distance: 0, done: false }],
        })
      }
      return { ...state, active }
    }
    case 'startAgain': {
      const prev = state.workouts.find((w) => w.id === action.workoutId)
      if (!prev) return state
      const active: Workout = {
        id: uid(),
        name: prev.name,
        start: Date.now(),
        end: 0,
        exercises: prev.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          notes: e.notes ?? '',
          sets: e.sets.map((s) => ({
            type: s.type,
            weight: s.weight,
            reps: s.reps,
            duration: s.duration,
            distance: s.distance,
            done: false,
          })),
        })),
      }
      return { ...state, active }
    }
    case 'updateActive':
      return { ...state, active: action.workout }
    case 'discardActive':
      return { ...state, active: null }
    case 'finishActive': {
      if (!state.active) return state
      const finished: Workout = { ...state.active, end: Date.now() }
      return { ...state, workouts: [finished, ...state.workouts], active: null }
    }
    case 'deleteWorkout':
      return { ...state, workouts: state.workouts.filter((w) => w.id !== action.id) }
    case 'saveRoutine': {
      const exists = state.routines.some((r) => r.id === action.routine.id)
      return {
        ...state,
        routines: exists
          ? state.routines.map((r) => (r.id === action.routine.id ? action.routine : r))
          : [action.routine, ...state.routines],
      }
    }
    case 'deleteRoutine':
      return { ...state, routines: state.routines.filter((r) => r.id !== action.id) }
    case 'addCustomExercise':
      return { ...state, customs: [...state.customs, action.exercise] }
    case 'deleteCustomExercise':
      return { ...state, customs: state.customs.filter((e) => e.id !== action.id) }
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'loadSample': {
      if (state.sampleLoaded) return state
      return {
        ...state,
        workouts: [...sampleWorkouts(), ...state.workouts],
        routines: [...state.routines, ...sampleRoutines()],
        sampleLoaded: true,
      }
    }
    case 'clearAll':
      return freshState()
    case 'importData':
      return {
        ...freshState(),
        ...action.state,
        settings: { ...DEFAULT_SETTINGS, ...(action.state.settings ?? {}) },
      }
    case 'toggleLike':
      return {
        ...state,
        liked: state.liked.includes(action.id)
          ? state.liked.filter((i) => i !== action.id)
          : [...state.liked, action.id],
      }
    case 'addComment': {
      const list = state.comments[action.id] ?? []
      return { ...state, comments: { ...state.comments, [action.id]: [...list, action.text] } }
    }
    case 'toggleFollow':
      return {
        ...state,
        followed: state.followed.includes(action.handle)
          ? state.followed.filter((h) => h !== action.handle)
          : [...state.followed, action.handle],
      }
    default:
      return state
  }
}

interface StoreCtx {
  state: AppState
  dispatch: React.Dispatch<Action>
  getExercise: (id: string) => Exercise | undefined
  allExercises: Exercise[]
  posts: ReturnType<typeof samplePosts>
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage full / unavailable */
    }
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme
  }, [state.settings.theme])

  const value = useMemo<StoreCtx>(() => {
    const allExercises = [...EXERCISES, ...state.customs]
    return {
      state,
      dispatch,
      allExercises,
      getExercise: (id: string) => allExercises.find((e) => e.id === id),
      posts: samplePosts(),
    }
  }, [state])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
