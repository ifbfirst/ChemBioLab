import type { ComponentType } from 'react'

/** Координата в мире локации. */
export type Vec3 = [number, number, number]

/**
 * Научный текст отдельно от трёхмерной модели.
 * note — честное пояснение, если картинка является схемой, а не фактом.
 */
export interface Fact {
  id: string
  title: string
  body: string
  note?: string
}

export type ObjectRole = 'cell' | 'chloroplast' | 'light' | 'water' | 'co2'

/** Точка взаимодействия. Научный текст подключается по factId, не зашит в геометрию. */
export interface InteractableDef {
  id: string
  role: ObjectRole
  factId: string
  prompt: string
  position: Vec3
  radius: number
  scale: number
}

export interface StageGroup {
  label: string
  objectIds: readonly string[]
}

export interface MissionStage {
  id: string
  objective: string
  /** Достаточно изучить любой объект из списка. */
  anyOf?: readonly string[]
  /** Нужно найти по одному объекту из каждой группы. */
  allGroups?: readonly StageGroup[]
}

export interface MissionDefinition {
  id: string
  title: string
  intro: string
  stages: readonly MissionStage[]
  summaryTitle: string
  summary: readonly string[]
  nextMissionTitle: string
  nextMissionText: string
}

export interface MissionChip {
  label: string
  done: boolean
}

export interface MissionView {
  missionTitle: string
  step: number
  steps: number
  objective: string
  chips?: readonly MissionChip[]
  markerIds: readonly string[]
  done: boolean
}

export interface Bounds {
  min: Vec3
  max: Vec3
}

export interface MissionRules {
  applyInspect: (studied: readonly string[], objectId: string) => readonly string[]
  getView: (studied: readonly string[], introOpen: boolean) => MissionView
  pickInteractable: (
    position: { x: number; y: number; z: number },
    studied: readonly string[],
  ) => InteractableDef | null
}

export interface LabPack {
  id: string
  subject: 'biology' | 'chemistry'
  title: string
  grade: number
  storageKey: string
  facts: Record<string, Fact>
  objects: readonly InteractableDef[]
  rules: MissionRules
  mission: MissionDefinition
  bounds: Bounds
  spawn: Vec3
  Location: ComponentType<{ markerIds: readonly string[] }>
}
