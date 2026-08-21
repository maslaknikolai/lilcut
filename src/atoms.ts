import { atom } from 'jotai'
import type { TimelineClip } from './projectTimeline'
import type { MediaAsset, Project } from './types'

export const projectsAtom = atom<Project[]>([])

export const mediaAssetsAtom = atom<MediaAsset[]>([])

export const libraryOrderAtom = atom<string[]>([])

export type ActiveModal =
  | { type: 'help' }
  | { type: 'clipEditor'; projectId: string; clip: TimelineClip | null; insertAt?: number }
  | null

export const activeModalAtom = atom<ActiveModal>(null)
