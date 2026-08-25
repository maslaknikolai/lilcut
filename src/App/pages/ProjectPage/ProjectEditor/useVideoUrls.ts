import { useEffect, useEffectEvent, useState } from 'react'
import { readOpfsFile } from '@/App/lib/opfs'
import type { Video } from '@/App/lib/types'

// preloads a blob url for every asset up front so playback never waits on an
// async OPFS read when crossing a file boundary; blob urls reference the
// on-disk File, nothing is read into memory
export function useVideoUrls(videos: Video[]): Record<string, string> {
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})

  const opfsNamesKey = videos.map((video) => video.opfsName).join('\n')

  const openVideos = useEffectEvent(() => {
    let isCancelled = false
    let createdUrls: string[] = []

    Promise.all(
      videos.map(async (video) => {
        const file = await readOpfsFile(video.opfsName).catch(() => null)
        if (!file) {
          return null
        }
        return [video.opfsName, URL.createObjectURL(file)] as const
      }),
    ).then((entries) => {
      const loadedEntries = Object.fromEntries(entries.filter((entry) => !!entry))
      const urls = Object.values(loadedEntries)

      if (isCancelled) {
        for (const url of urls) {
          URL.revokeObjectURL(url)
        }
        return
      }

      createdUrls = urls
      setVideoUrls(loadedEntries)
    })

    return () => {
      isCancelled = true
      for (const url of createdUrls) {
        URL.revokeObjectURL(url)
      }
    }
  })

  useEffect(() => openVideos(), [opfsNamesKey])

  return videoUrls
}
