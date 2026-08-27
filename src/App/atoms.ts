import { atom } from 'jotai'
import type { TimelineClip } from '@/App/lib/projectTimeline'
import type { LibraryFilter, Video, Project } from '@/App/lib/types'

export const projectsAtom = atom<Project[]>([])

export const videosAtom = atom<Video[]>([])

export const libraryOrderAtom = atom<string[]>([])

export const libraryFilterAtom = atom<LibraryFilter>('all')

export const playingPreviewAtom = atom<string | null>(null)

export const ModalType = {
  Help: 'help',
  ClipEdit: 'clipEdit',
  ClipCreate: 'clipCreate',
  VideoInfo: 'videoInfo',
  ProjectRemove: 'projectRemove',
} as const

export type ModalType = (typeof ModalType)[keyof typeof ModalType]

export type ActiveModal =
  | { type: typeof ModalType.Help }
  | { type: typeof ModalType.ClipEdit; projectId: string; clip: TimelineClip }
  | { type: typeof ModalType.ClipCreate; projectId: string; insertAt?: number }
  | { type: typeof ModalType.VideoInfo; opfsName: string }
  | { type: typeof ModalType.ProjectRemove; projectId: string }
  | null

export const activeModalAtom = atom<ActiveModal>(null)

export const isSidebarOpenAtom = atom(true)
