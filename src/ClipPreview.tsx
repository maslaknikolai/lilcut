import { useEffect, useEffectEvent, useState } from 'react'
import { useAtomValue } from 'jotai'
import { mediaFilesAtom } from './atoms'
import { readOpfsFile } from './opfs'
import type { Clip } from './types'

type ClipPreviewProps = {
  clip: Clip
}

export function ClipPreview({ clip }: ClipPreviewProps) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const mediaFile = mediaFiles.find((file) => file.id === clip.mediaFileId)
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

  if (!videoUrl) {
    return null
  }

  const start = clip.cutStart ?? 0
  const fragment = clip.cutEnd !== undefined ? `#t=${start},${clip.cutEnd}` : `#t=${start}`

  return <video src={`${videoUrl}${fragment}`} controls className="max-h-full max-w-full" />
}
