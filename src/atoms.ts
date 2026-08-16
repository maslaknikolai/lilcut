import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Recording } from './types'

export const recordingsAtom = atomWithStorage<Recording[]>('recordings', [])
export const selectedRecordingIdAtom = atom<string | null>(null)
export const sidebarOpenAtom = atom(true)
