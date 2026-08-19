import { useEffect, useEffectEvent } from 'react'
import { libraryItemId, useLibraryItems } from './library'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

export function useSyncSelectedLibraryItem(): void {
  const library = useLibraryItems()
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  const syncSelection = useEffectEvent(() => {
    const isValid = !!selectedLibraryItemId && library.some((item) => libraryItemId(item) === selectedLibraryItemId)
    if (!isValid) {
      setSelectedLibraryItemId(library[0] ? libraryItemId(library[0]) : null)
    }
  })

  useEffect(() => {
    syncSelection()
  }, [library])
}
