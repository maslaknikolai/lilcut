import { atom } from 'jotai'
import type { TimelineClip } from '@/App/lib/projectTimeline'
import type { LibraryFilter, Video, Project } from '@/App/lib/types'

export const projectsAtom = atom<Project[]>([])

export const videosAtom = atom<Video[]>([])

export const libraryOrderAtom = atom<string[]>([])

export const libraryFilterAtom = atom<LibraryFilter>('all')

export type ActiveModal =
  | { type: 'help' }
  | { type: 'clipEdit'; projectId: string; clip: TimelineClip }
  | { type: 'clipCreate'; projectId: string; insertAt?: number }
  | { type: 'videoInfo'; opfsName: string }
  | null

export const activeModalAtom = atom<ActiveModal>(null)

export const isSidebarOpenAtom = atom(true)
