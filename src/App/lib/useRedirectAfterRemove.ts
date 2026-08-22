import { libraryItemId, useLibraryItems } from '@/App/lib/library'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

// after removing the selected library item, land on the first remaining one
// instead of the "Item not found" empty state
export function useRedirectAfterRemove() {
  const library = useLibraryItems()
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  return function redirectAfterRemove(removedId: string) {
    if (selectedLibraryItemId !== removedId) {
      return
    }
    const firstRemainingItem = library.find((item) => libraryItemId(item) !== removedId)
    setSelectedLibraryItemId(firstRemainingItem ? libraryItemId(firstRemainingItem) : null)
  }
}
