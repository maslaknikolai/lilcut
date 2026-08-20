import { useEffect, useEffectEvent, useState } from 'react'
import { readOpfsFile } from './opfs'
import type { MediaAsset } from './types'

// preloads a blob url for every asset up front so playback never waits on an
// async OPFS read when crossing a file boundary; blob urls reference the
// on-disk File, nothing is read into memory
export function useMediaAssetVideoUrls(mediaAssets: MediaAsset[]): Record<string, string> {
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({})

  const opfsNamesKey = mediaAssets.map((mediaAsset) => mediaAsset.opfsName).join('\n')

  const openMediaAssets = useEffectEvent(() => {
    let isCancelled = false
    let createdUrls: string[] = []

    Promise.all(
      mediaAssets.map(async (mediaAsset) => {
        const file = await readOpfsFile(mediaAsset.opfsName).catch(() => null)
        if (!file) {
          return null
        }
        return [mediaAsset.opfsName, URL.createObjectURL(file)] as const
      }),
    ).then((entries) => {
      const loadedEntries = Object.fromEntries(entries.filter((entry) => entry !== null))
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

  useEffect(() => openMediaAssets(), [opfsNamesKey])

  return videoUrls
}
