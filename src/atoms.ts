import { atom } from 'jotai'
import type { TimelineClip } from './projectTimeline'
import type { MediaAsset, Project } from './types'

export const projectsAtom = atom<Project[]>([])

export const mediaAssetsAtom = atom<MediaAsset[]>([])

export const libraryOrderAtom = atom<string[]>([])

export type ActiveModal =
  | { type: 'help' }
  | { type: 'clipEdit'; projectId: string; clip: TimelineClip }
  | { type: 'clipCreate'; projectId: string; insertAt?: number }
  | null

export const activeModalAtom = atom<ActiveModal>(null)

export const isSidebarOpenAtom = atom(true)
