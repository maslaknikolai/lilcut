import { libraryItemId, useLibraryItems } from '@/App/lib/library'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

export function useRedirectAfterRemove() {
  const library = useLibraryItems()
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  return function redirectAfterRemove(removedId: string) {
    if (selectedLibraryItemId !== removedId) {
      return
    }
    const removedIndex = library.findIndex((item) => libraryItemId(item) === removedId)
    const remainingItems = library.filter((item) => libraryItemId(item) !== removedId)
    // keep the same slot: the item that shifts up, or the last one when the removed was last
    const nextItem = remainingItems[removedIndex] ?? remainingItems.at(-1)
    setSelectedLibraryItemId(nextItem ? libraryItemId(nextItem) : null)
  }
}
