import { useLibraryItems } from '@/App/lib/library'
import type { Video } from '@/App/lib/types'

export function useOrderedVideos(): Video[] {
  const library = useLibraryItems()
  return library.flatMap((item) => (item.type === 'video' ? [item.video] : []))
}
