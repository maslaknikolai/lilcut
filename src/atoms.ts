import { atomWithStorage } from 'jotai/utils'
import type { MediaFile } from './types'

export const mediaFilesAtom = atomWithStorage<MediaFile[]>('mediaFiles', [], undefined, {
  getOnInit: true,
})

export const selectedMediaFileIdAtom = atomWithStorage<string | null>(
  'selectedMediaFileId',
  null,
  undefined,
  { getOnInit: true },
)
