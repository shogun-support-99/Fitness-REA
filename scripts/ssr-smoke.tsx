/**
 * SSR smoke test: renders every screen with seeded state to catch runtime errors.
 * Run:  npm run smoke
 */
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */
const now = Date.now()
const seedState = {
  active: {
    id: 'w0',
    name: 'Test Workout',
    start: now - 600000,
    end: 0,
    exercises: [
      {
        exerciseId: 'barbell-bench-press',
        notes: 'feeling strong',
        sets: [
          { type: 'warmup', weight: 40, reps: 10, duration: 0, distance: 0, done: true },
          { type: 'normal', weight: 60, reps: 8, duration: 0, distance: 0, done: true },
          { type: 'normal', weight: 60, reps: 7, duration: 0, distance: 0, done: false },
        ],
      },
      {
        exerciseId: 'treadmill-run',
        notes: '',
        sets: [{ type: 'normal', weight: 0, reps: 0, duration: 30, distance: 5, done: true }],
      },
    ],
  },
  workouts: [
    {
      id: 'w1',
      name: 'Push Day',
      start: now - 86400000,
      end: now - 86400000 + 3600000,
      exercises: [
        {
          exerciseId: 'barbell-bench-press',
          notes: '',
          sets: [
            { type: 'normal', weight: 60, reps: 8, duration: 0, distance: 0, done: true },
            { type: 'failure', weight: 55, reps: 6, duration: 0, distance: 0, done: true },
          ],
        },
        {
          exerciseId: 'plank',
          notes: '',
          sets: [{ type: 'normal', weight: 0, reps: 0, duration: 2, distance: 0, done: true }],
        },
      ],
    },
  ],
  routines: [
    {
      id: 'r1',
      name: 'Push Day',
      createdAt: now - 100000,
      exercises: [
        {
          exerciseId: 'barbell-bench-press',
          notes: '',
          sets: [{ type: 'normal', weight: 60, reps: 8, duration: 0, distance: 0 }],
        },
      ],
    },
  ],
  customs: [],
  dataset: [
    {
      id: 'db-0001',
      name: '3/4 Sit-Up',
      equipment: 'Bodyweight',
      primary: 'Core',
      secondary: [],
      category: 'strength',
      instructions: [
        'Lie flat on your back with your knees bent and feet flat on the ground.',
        'Place your hands behind your head with your elbows pointing outwards.',
      ],
      media: '0001-2gPfomN',
    },
    {
      id: 'db-0900',
      name: 'Test Kettlebell Swing',
      equipment: 'Kettlebell',
      primary: 'Full Body',
      secondary: ['Glutes', 'Hamstrings'],
      category: 'strength',
      instructions: ['Hinge at the hips.'],
      media: '0002-Hy9D21L',
    },
  ],
  settings: {
    name: 'Test',
    unit: 'kg',
    theme: 'dark',
    defaultRest: 90,
    restAutoStart: true,
    sound: false,
  },
  liked: [],
  comments: {},
  followed: [],
  sampleLoaded: true,
}

;(globalThis as any).localStorage = {
  _s: JSON.stringify(seedState),
  getItem() {
    return this._s
  },
  setItem(_k: string, v: string) {
    this._s = v
  },
  removeItem() {},
  clear() {},
}

import { StoreProvider } from '../src/lib/store'
import { UICtx, type UIApi } from '../src/app/uiContext'
import AppShell from '../src/app/AppShell'
import Home from '../src/app/screens/Home'
import RoutinesTab from '../src/app/screens/RoutinesTab'
import ExercisesTab from '../src/app/screens/ExercisesTab'
import FeedTab from '../src/app/screens/FeedTab'
import ProfileTab from '../src/app/screens/ProfileTab'
import History from '../src/app/screens/History'
import Logger from '../src/app/screens/Logger'
import Picker from '../src/app/screens/Picker'
import CustomExercise from '../src/app/screens/CustomExercise'
import ExerciseDetail from '../src/app/screens/ExerciseDetail'
import WorkoutDetail from '../src/app/screens/WorkoutDetail'
import RoutineDetail from '../src/app/screens/RoutineDetail'
import RoutineEditor from '../src/app/screens/RoutineEditor'
import Landing from '../src/landing/Landing'

const fakeUI: UIApi = {
  push() {},
  pop() {},
  resetTo() {},
  toast() {},
  startRest() {},
  adjustRest() {},
  stopRest() {},
  datasetStatus: 'ready',
  retryDataset() {},
}

function wrap(el: React.ReactElement) {
  return (
    <StoreProvider>
      <UICtx.Provider value={fakeUI}>{el}</UICtx.Provider>
    </StoreProvider>
  )
}

function render(name: string, el: React.ReactElement) {
  const html = renderToString(el)
  if (!html || html.length < 40) throw new Error(`${name} produced empty output`)
  console.log(`OK  ${name} (${html.length} chars)`)
}

render('Landing', <Landing />)
render('AppShell', <StoreProvider><AppShell /></StoreProvider>)
render('Home', wrap(<Home />))
render('RoutinesTab', wrap(<RoutinesTab />))
render('ExercisesTab', wrap(<ExercisesTab />))
render('FeedTab', wrap(<FeedTab />))
render('ProfileTab', wrap(<ProfileTab />))
render('History', wrap(<History />))
render('Logger', wrap(<Logger />))
render('Picker', wrap(<Picker onPick={() => {}} />))
render('CustomExercise', wrap(<CustomExercise />))
render('ExerciseDetail', wrap(<ExerciseDetail id="barbell-bench-press" />))
render('ExerciseDetailCardio', wrap(<ExerciseDetail id="treadmill-run" />))
render('ExerciseDetailDataset', wrap(<ExerciseDetail id="db-0001" />))
render('WorkoutDetail', wrap(<WorkoutDetail id="w1" />))
render('RoutineDetail', wrap(<RoutineDetail id="r1" />))
render('RoutineEditorEdit', wrap(<RoutineEditor id="r1" />))
render('RoutineEditorNew', wrap(<RoutineEditor />))

console.log('\nALL SCREENS RENDERED OK')
