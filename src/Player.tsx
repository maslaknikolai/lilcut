import { useEffect, useEffectEvent, useState } from 'react'
import { useAtomValue } from 'jotai'
import { recordingsAtom, selectedRecordingIdAtom } from './atoms'
import { readOpfsFile } from './opfs'

export function Player() {
  const recordings = useAtomValue(recordingsAtom)
  const selectedRecordingId = useAtomValue(selectedRecordingIdAtom)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const selected = recordings.find((recording) => recording.id === selectedRecordingId)

  const openRecording = useEffectEvent(() => {
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

  useEffect(() => openRecording(), [selected])

  if (!videoUrl) {
    return (
      <div className="flex flex-1 items-center justify-center text-neutral-600">
        Select a recording
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <video src={videoUrl} controls className="max-h-full max-w-full" />
    </div>
  )
}
