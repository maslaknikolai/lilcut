import { useLibraryItems } from '@/App/lib/library'
import type { MediaAsset } from '@/App/lib/types'

export function useOrderedMediaAssets(): MediaAsset[] {
  const library = useLibraryItems()
  return library.flatMap((item) => (item.type === 'media' ? [item.mediaAsset] : []))
}
