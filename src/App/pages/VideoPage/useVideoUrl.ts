import { useEffect, useEffectEvent, useState } from 'react'
import { readOpfsFile } from '@/App/lib/opfs'
import type { Video } from '@/App/lib/types'

export function useVideoUrl(video: Video | undefined): string | null {
  const [videoSource, setVideoSource] = useState<{ opfsName: string; url: string } | null>(null)

  const openVideo = useEffectEvent(() => {
    if (!video) {
      setVideoSource(null)
      return () => {}
    }

    const { opfsName } = video
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

  useEffect(() => openVideo(), [video])

  // a previous asset's url must never leak through while the new one loads —
  // callers unmount the <video> for that gap instead of swapping src in place,
  // so stale timeupdate/pause events can't fire against the new clip's timings
  const isVideoSourceCurrent = !!videoSource && videoSource.opfsName === video?.opfsName
  return isVideoSourceCurrent ? videoSource.url : null
}
