import { useEffect, useEffectEvent, useState } from 'react'
import { readOpfsFile } from './opfs'
import type { MediaAsset } from './types'

export function useMediaAssetVideoUrl(mediaAsset: MediaAsset | undefined): string | null {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const openMediaAsset = useEffectEvent(() => {
    if (!mediaAsset) {
      setVideoUrl(null)
      return () => {}
    }

    let url: string | null = null
    let isCancelled = false
    readOpfsFile(mediaAsset.opfsName).then((downloadedFile) => {
      if (isCancelled) {
        return
      }
      url = URL.createObjectURL(downloadedFile)
      setVideoUrl(url)
    })

    return () => {
      isCancelled = true
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  })

  useEffect(() => openMediaAsset(), [mediaAsset])

  return videoUrl
}
