import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { AppState, Contact, Exercise, Post, Routine, Settings, Workout } from './types'
import { EXERCISES } from '../data/exercises'
import { DATASET_EXERCISES } from '../data/exercises-dataset'
import { dataKey } from './auth'
import { codeToPost } from './share'
import { uid } from './utils'
import { samplePosts } from './seed'

const DEFAULT_SETTINGS: Settings = {
  name: 'Athlete',
  unit: 'kg',
  theme: 'dark',
  defaultRest: 90,
  restAutoStart: true,
  sound: true,
}

export function freshState(name = 'Athlete'): AppState {
  return {
    active: null,
    workouts: [],
    routines: [],
    customs: [],
    dataset: DATASET_EXERCISES,
    settings: { ...DEFAULT_SETTINGS, name },
    posts: samplePosts(),
    contacts: [],
    followedHandles: ['mayalifts'],
  }
}

function loadState(accountId: string): AppState {
  try {
    const raw = localStorage.getItem(dataKey(accountId))
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...freshState(parsed.settings?.name),
      ...parsed,
      dataset: DATASET_EXERCISES,
      posts: parsed.posts ?? samplePosts(),
      contacts: parsed.contacts ?? [],
      followedHandles: parsed.followedHandles ?? ['mayalifts'],
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
  | { t: 'clearAll' }
  | { t: 'importData'; state: AppState }
  | { t: 'likePost'; id: string }
  | { t: 'commentPost'; id: string; text: string }
  | { t: 'shareWorkout'; workoutId: string }
  | { t: 'deletePost'; id: string }
  | { t: 'importSharedPost'; code: string }
  | { t: 'addContact'; name: string; handle: string }
  | { t: 'deleteContact'; id: string }
  | { t: 'toggleContactFollow'; id: string }
  | { t: 'toggleFollowHandle'; handle: string }

export function reducer(state: AppState, action: Action): AppState {
  switch (action.t) {
    case 'startWorkout': {
      const routine = action.routineId
        ? state.routines.find((r) => r.id === action.routineId)
        : undefined
      const active: Workout = {
        id: uid(),
        name: routine ? routine.name : `Workout ${state.workouts.length + 1}`,
        routineId: routine?.id,
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
    case 'clearAll':
      return freshState(state.settings.name)
    case 'importData':
      return {
        ...freshState(action.state.settings?.name),
        ...action.state,
        dataset: DATASET_EXERCISES,
        settings: { ...DEFAULT_SETTINGS, ...(action.state.settings ?? {}) },
      }
    case 'likePost':
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p
        ),
      }
    case 'commentPost':
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id
            ? { ...p, comments: [...p.comments, { name: state.settings.name, text: action.text, at: Date.now() }] }
            : p
        ),
      }
    case 'shareWorkout': {
      const w = state.workouts.find((x) => x.id === action.workoutId)
      if (!w) return state
      if (state.posts.some((p) => p.workoutId === w.id)) return state
      const nameOf = (id: string) =>
        [...EXERCISES, ...state.dataset, ...state.customs].find((e) => e.id === id)?.name ?? 'Exercise'
      const post: Post = {
        id: 'own-' + uid(),
        workoutId: w.id,
        author: { name: state.settings.name, handle: 'you', color: 'var(--accent)', kind: 'me' },
        workout: {
          name: w.name,
          start: w.start,
          durationMin: Math.max(1, Math.round((w.end - w.start) / 60000)),
          volumeKg: w.exercises.reduce(
            (sum, e) => sum + e.sets.filter((s) => s.done).reduce((v, s) => v + s.weight * s.reps, 0),
            0
          ),
          exercises: w.exercises.map((e) => ({
            name: nameOf(e.exerciseId),
            sets: e.sets.filter((s) => s.done).map((s) => ({
              type: s.type,
              weight: s.weight,
              reps: s.reps,
              duration: s.duration,
              distance: s.distance,
            })),
          })),
        },
        createdAt: Date.now(),
        likes: 0,
        likedByMe: false,
        comments: [],
      }
      return { ...state, posts: [post, ...state.posts] }
    }
    case 'deletePost':
      return { ...state, posts: state.posts.filter((p) => p.id !== action.id) }
    case 'importSharedPost': {
      const post = codeToPost(action.code)
      if (!post) return state
      // the same share link can be opened twice — import it only once
      const dup = state.posts.some(
        (p) =>
          p.author.handle === post.author.handle &&
          p.workout.name === post.workout.name &&
          p.createdAt === post.createdAt
      )
      if (dup) return state
      const handle = post.author.handle
      const known = state.contacts.some((c) => c.handle === handle)
      const contacts = known
        ? state.contacts
        : [
            {
              id: uid(),
              name: post.author.name,
              handle,
              color: post.author.color,
              followed: true,
              addedAt: Date.now(),
            } as Contact,
            ...state.contacts,
          ]
      return { ...state, contacts, posts: [post, ...state.posts] }
    }
    case 'addContact': {
      const handle = action.handle.trim().replace(/^@/, '').toLowerCase() || action.name.toLowerCase()
      if (state.contacts.some((c) => c.handle === handle)) return state
      const colors = ['#2f6bff', '#ec4899', '#f59e0b', '#22c55e', '#a855f7', '#06b6d4']
      return {
        ...state,
        contacts: [
          {
            id: uid(),
            name: action.name.trim() || handle,
            handle,
            color: colors[state.contacts.length % colors.length],
            followed: true,
            addedAt: Date.now(),
          },
          ...state.contacts,
        ],
      }
    }
    case 'deleteContact':
      return { ...state, contacts: state.contacts.filter((c) => c.id !== action.id) }
    case 'toggleContactFollow':
      return {
        ...state,
        contacts: state.contacts.map((c) => (c.id === action.id ? { ...c, followed: !c.followed } : c)),
      }
    case 'toggleFollowHandle':
      return {
        ...state,
        followedHandles: state.followedHandles.includes(action.handle)
          ? state.followedHandles.filter((h) => h !== action.handle)
          : [...state.followedHandles, action.handle],
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
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({
  accountId,
  accountName,
  children,
}: {
  accountId: string
  accountName?: string
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, accountId, (id) => {
    const loaded = loadState(id)
    return accountName && !loaded.settings.name ? { ...loaded, settings: { ...loaded.settings, name: accountName } } : loaded
  })

  useEffect(() => {
    try {
      // bulky, account-derivable data is never persisted
      const { dataset: _dataset, ...slim } = state
      localStorage.setItem(dataKey(accountId), JSON.stringify(slim))
    } catch {
      /* storage full / unavailable */
    }
  }, [state, accountId])

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme
  }, [state.settings.theme])

  const value = useMemo<StoreCtx>(() => {
    const allExercises = [...EXERCISES, ...state.dataset, ...state.customs]
    return {
      state,
      dispatch,
      allExercises,
      getExercise: (id: string) => allExercises.find((e) => e.id === id),
    }
  }, [state])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
