import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { Fact, LabPack, MissionView } from '../platform/types'
import { loadProgress, saveProgress } from '../platform/progress'
import { debugPose, debugTeleport } from './input'

export interface GameState {
  studied: readonly string[]
  introOpen: boolean
  paused: boolean
  panelFactId: string | null
  focusingId: string | null
  promptId: string | null
  finale: 'pending' | 'summary' | 'next' | 'closed'
  resetPose: number
  pointerLocked: boolean
  synthesis: boolean
}

type Action =
  | { type: 'dismiss-intro' }
  | { type: 'pause'; paused: boolean }
  | { type: 'prompt'; id: string | null }
  | { type: 'pointer'; locked: boolean }
  | { type: 'focus'; id: string }
  | { type: 'cancel-focus' }
  | { type: 'inspect'; id: string; factId: string; studied: readonly string[] }
  | { type: 'launch' }
  | { type: 'close-panel' }
  | { type: 'finale'; mode: 'summary' | 'next' | 'closed' }
  | { type: 'restart' }

function createState(storageKey: string): GameState {
  const studied = loadProgress(storageKey)
  return {
    studied,
    introOpen: false,
    paused: false,
    panelFactId: null,
    focusingId: null,
    promptId: null,
    finale: 'pending',
    resetPose: 0,
    pointerLocked: false,
    synthesis: false,
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'dismiss-intro':
      return state.introOpen ? { ...state, introOpen: false } : state
    case 'pause':
      return state.paused === action.paused ? state : { ...state, paused: action.paused }
    case 'prompt':
      return state.promptId === action.id ? state : { ...state, promptId: action.id }
    case 'pointer':
      return state.pointerLocked === action.locked ? state : { ...state, pointerLocked: action.locked }
    case 'focus':
      if (state.introOpen || state.paused || state.panelFactId || state.focusingId) return state
      if (state.finale === 'summary' || state.finale === 'next') return state
      return { ...state, focusingId: action.id }
    case 'cancel-focus':
      return state.focusingId ? { ...state, focusingId: null } : state
    case 'inspect':
      if (state.introOpen || state.paused) return state
      if (state.finale === 'summary' || state.finale === 'next') return state
      return {
        ...state,
        studied: action.studied,
        panelFactId: action.factId,
        focusingId: action.id,
      }
    case 'launch':
      return {
        ...state,
        synthesis: true,
        panelFactId: 'photosynthesis',
        focusingId: 'synthesis',
      }
    case 'close-panel':
      return state.panelFactId ? { ...state, panelFactId: null } : state
    case 'finale':
      return state.finale === action.mode ? state : { ...state, finale: action.mode }
      case 'restart':
        return {
          studied: [],
          introOpen: false,
          paused: false,
          panelFactId: null,
          focusingId: 'home',
          promptId: null,
          finale: 'pending',
          resetPose: state.resetPose + 1,
          pointerLocked: false,
          synthesis: false,
        }
    default:
      return state
  }
}

interface LabApi {
  inspect: (id: string, factId: string) => void
  focus: (id: string) => void
  cancelFocus: () => void
  closePanel: () => void
  dismissIntro: () => void
  setPaused: (paused: boolean) => void
  setPrompt: (id: string | null) => void
  setPointer: (locked: boolean) => void
  showFinale: (mode: 'summary' | 'next' | 'closed') => void
  restart: () => void
  launch: () => void
}

interface LabContextValue {
  pack: LabPack
  state: GameState
  view: MissionView
  facts: Record<string, Fact>
  api: LabApi
}

const LabContext = createContext<LabContextValue | null>(null)

export function GameProvider({ pack, children }: { pack: LabPack; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, pack.storageKey, createState)
  const stateRef = useRef(state)
  stateRef.current = state

  const api = useMemo<LabApi>(
    () => ({
      inspect(id, factId) {
        dispatch({
          type: 'inspect',
          id,
          factId,
          studied: pack.rules.applyInspect(stateRef.current.studied, id),
        })
      },
      launch() {
        dispatch({ type: 'launch' })
      },
      focus(id) {
        dispatch({ type: 'focus', id })
      },
      cancelFocus() {
        dispatch({ type: 'cancel-focus' })
      },
      closePanel() {
        dispatch({ type: 'close-panel' })
      },
      dismissIntro() {
        dispatch({ type: 'dismiss-intro' })
      },
      setPaused(paused) {
        dispatch({ type: 'pause', paused })
      },
      setPrompt(id) {
        dispatch({ type: 'prompt', id })
      },
      setPointer(locked) {
        dispatch({ type: 'pointer', locked })
      },
      showFinale(mode) {
        dispatch({ type: 'finale', mode })
      },
      restart() {
        dispatch({ type: 'restart' })
      },
    }),
    [pack.rules],
  )

  const view = useMemo(
    () => pack.rules.getView(state.studied, state.introOpen),
    [pack.rules, state.studied, state.introOpen],
  )

  useEffect(() => {
    saveProgress(pack.storageKey, state.studied)
  }, [pack.storageKey, state.studied])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__lab = {
      pose: debugPose,
      teleport(x, y, z) {
        debugTeleport.current = { x, y, z }
      },
      inspect(id) {
        const obj = pack.objects.find((item) => item.id === id)
        if (!obj) return
        api.inspect(obj.id, obj.factId)
      },
      getState: () => stateRef.current,
    }
    return () => {
      delete window.__lab
    }
  }, [api, pack.objects])

  const value = useMemo<LabContextValue>(
    () => ({ pack, state, view, facts: pack.facts, api }),
    [pack, state, view, api],
  )

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>
}

export function useLab(): LabContextValue {
  const value = useContext(LabContext)
  if (!value) throw new Error('Лаборатория не подключена')
  return value
}

declare global {
  interface Window {
    __lab?: {
      pose: { x: number; y: number; z: number }
      teleport: (x: number, y: number, z: number) => void
      inspect: (id: string) => void
      getState: () => GameState
    }
  }
}
