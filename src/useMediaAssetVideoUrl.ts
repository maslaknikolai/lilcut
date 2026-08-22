import { useEffect, useEffectEvent, useState } from 'react'
import { readOpfsFile } from './opfs'
import type { MediaAsset } from './types'

export function useMediaAssetVideoUrl(mediaAsset: MediaAsset | undefined): string | null {
  const [videoSource, setVideoSource] = useState<{ opfsName: string; url: string } | null>(null)

  const openMediaAsset = useEffectEvent(() => {
    if (!mediaAsset) {
      setVideoSource(null)
      return () => {}
    }

    const { opfsName } = mediaAsset
    let url: string | null = null
    let isCancelled = false
    readOpfsFile(opfsName).then((downloadedFile) => {
      if (isCancelled) {
        return
      }
      url = URL.createObjectURL(downloadedFile)
      setVideoSource({ opfsName, url })
    })

    return () => {
      isCancelled = true
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  })

  useEffect(() => openMediaAsset(), [mediaAsset])

  // a previous asset's url must never leak through while the new one loads —
  // callers unmount the <video> for that gap instead of swapping src in place,
  // so stale timeupdate/pause events can't fire against the new clip's timings
  const isVideoSourceCurrent = !!videoSource && videoSource.opfsName === mediaAsset?.opfsName
  return isVideoSourceCurrent ? videoSource.url : null
}
