import { atom } from 'jotai'
import type { MediaAsset, Project } from './types'

export const projectsAtom = atom<Project[]>([])

export const mediaAssetsAtom = atom<MediaAsset[]>([])

export const libraryOrderAtom = atom<string[]>([])
