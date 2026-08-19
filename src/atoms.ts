import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { MediaAsset, Project } from './types'

export const projectsAtom = atom<Project[]>([])

export const libraryOrderAtom = atom<string[]>([])

export const mediaAssetsAtom = atom<MediaAsset[]>([])

export const selectedLibraryItemIdAtom = atomWithStorage<string | null>('selectedLibraryItemId', null, undefined, {
  getOnInit: true,
})
