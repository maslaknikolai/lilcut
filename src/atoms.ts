import { atomWithStorage } from 'jotai/utils'
import type { MediaFile, Project } from './types'

export const mediaFilesAtom = atomWithStorage<MediaFile[]>('mediaFiles', [], undefined, {
  getOnInit: true,
})

export const selectedMediaFileIdAtom = atomWithStorage<string | null>('selectedMediaFileId', null, undefined, {
  getOnInit: true,
})

export const projectsAtom = atomWithStorage<Project[]>('projects', [], undefined, {
  getOnInit: true,
})

export const selectedProjectIdAtom = atomWithStorage<string | null>('selectedProjectId', null, undefined, {
  getOnInit: true,
})
