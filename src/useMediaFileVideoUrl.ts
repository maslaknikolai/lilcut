import { useEffect, useEffectEvent, useState } from 'react'
import { readOpfsFile } from './opfs'
import type { MediaFile } from './types'

export function useMediaFileVideoUrl(mediaFile: MediaFile | undefined): string | null {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const openMediaFile = useEffectEvent(() => {
    if (!mediaFile) {
      setVideoUrl(null)
      return () => {}
    }

    let url: string | null = null
    let isCancelled = false
    readOpfsFile(mediaFile.opfsName).then((downloadedFile) => {
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

  useEffect(() => openMediaFile(), [mediaFile])

  return videoUrl
}
