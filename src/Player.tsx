import { useEffect, useEffectEvent, useState } from 'react'
import { useAtomValue } from 'jotai'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { readOpfsFile } from './opfs'

export function Player() {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const selectedMediaFileId = useAtomValue(selectedMediaFileIdAtom)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const selected = mediaFiles.find((file) => file.id === selectedMediaFileId)

  const openFile = useEffectEvent(() => {
    if (!selected) {
      setVideoUrl(null)
      return () => {}
    }

    let url: string | null = null
    let isCancelled = false
    readOpfsFile(selected.opfsName).then((file) => {
      if (isCancelled) {
        return
      }
      url = URL.createObjectURL(file)
      setVideoUrl(url)
    })

    return () => {
      isCancelled = true
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  })

  useEffect(() => openFile(), [selected])

  if (!videoUrl) {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-neutral-600">
        {mediaFiles.length === 0 ? 'Record or add your first file' : 'Select a file'}
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <video
        src={videoUrl}
        controls
        className="max-h-full max-w-full"
      />
    </div>
  )
}
