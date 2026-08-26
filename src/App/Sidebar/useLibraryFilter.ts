import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { libraryItemId } from '@/App/lib/library'
import type { LibraryItem } from '@/App/lib/types'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

export const LIBRARY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'project', label: 'Projects' },
  { value: 'video', label: 'Videos' },
] as const

export type LibraryFilter = (typeof LIBRARY_FILTERS)[number]['value']

export function useLibraryFilter(library: LibraryItem[]) {
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all')
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
