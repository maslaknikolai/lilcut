import { useEffect, useEffectEvent, useRef } from 'react'
import { useAtom } from 'jotai'
import { libraryFilterAtom } from '@/App/atoms'
import { libraryItemId } from '@/App/lib/library'
import type { LibraryItem } from '@/App/lib/types'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

export const LIBRARY_FILTERS = [
  { value: 'project', label: 'Projects' },
  { value: 'video', label: 'Videos' },
  { value: 'all', label: 'All' },
] as const

export function useLibraryFilter(library: LibraryItem[]) {
  const [libraryFilter, setLibraryFilter] = useAtom(libraryFilterAtom)
  const [selectedLibraryItemId] = useSelectedLibraryItemId()

  const selectedItem = library.find((item) => libraryItemId(item) === selectedLibraryItemId)
  const hasMatchedSelectedItemRef = useRef(false)

  const matchFilterToSelectedItemOnce = useEffectEvent(() => {
    if (hasMatchedSelectedItemRef.current || !selectedItem) {
      return
    }
    hasMatchedSelectedItemRef.current = true
    setLibraryFilter(selectedItem.type)
  })

  useEffect(() => {
    matchFilterToSelectedItemOnce()
  }, [selectedItem?.type])

  return [libraryFilter, setLibraryFilter] as const
}
