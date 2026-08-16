import { atomWithStorage } from 'jotai/utils'
import type { Recording } from './types'

export const recordingsAtom = atomWithStorage<Recording[]>('recordings', [], undefined, {
  getOnInit: true,
})

export const selectedRecordingIdAtom = atomWithStorage<string | null>(
  'selectedRecordingId',
  null,
  undefined,
  { getOnInit: true },
)
