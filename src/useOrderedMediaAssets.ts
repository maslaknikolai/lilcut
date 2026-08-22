import { useLibraryItems } from './library'
import type { MediaAsset } from './types'

export function useOrderedMediaAssets(): MediaAsset[] {
  const library = useLibraryItems()
  return library.flatMap((item) => (item.type === 'media' ? [item.mediaAsset] : []))
}
