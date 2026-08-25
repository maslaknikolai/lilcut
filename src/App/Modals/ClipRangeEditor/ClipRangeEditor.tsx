import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue } from 'jotai'
import { ChevronLeft, Play } from 'lucide-react'
import { videosAtom } from '@/App/atoms'
import { Modal } from '@/App/Modals/Modal'
import { ClipTrimBar } from '@/App/Modals/ClipRangeEditor/ClipTrimBar'
import { formatTimestamp } from '@/App/lib/formatTimestamp'
import { isClipRangeValid } from '@/App/lib/projectTimeline'
import { readOpfsFile } from '@/App/lib/opfs'
import type { Clip } from '@/App/lib/types'

function roundTime(time: number): number {
  return Math.round(time * 100) / 100
}
type ClipRangeEditorProps = {
  clip: Clip
  title: string
  onClipChange: (clip: Clip) => void
  actions: ReactNode
  onBack?: () => void
  onClose: () => void
}

export function ClipRangeEditor({ clip, title, onClipChange, actions, onBack, onClose }: ClipRangeEditorProps) {
  const videos = useAtomValue(videosAtom)

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isPreviewingRef = useRef(false)

  const video = videos.find((item) => item.opfsName === clip.videoOpfsName)

  const cutStart = clip.cutStart ?? 0
  const cutEnd = clip.cutEnd
  const isToVideoEnd = cutEnd === undefined

  const openVideo = useEffectEvent(() => {
    if (!video) {
      setVideoUrl(null)
      return () => {}
    }

    let url: string | null = null
    let isCancelled = false
    readOpfsFile(video.opfsName).then((downloadedFile) => {
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

  useEffect(() => openVideo(), [video])

  function changeCutStart(value: number) {
    onClipChange({ ...clip, cutStart: value })
    if (videoRef.current) {
      videoRef.current.currentTime = value
    }
  }

  function changeCutEnd(value: number) {
    onClipChange({ ...clip, cutEnd: value })
    if (videoRef.current) {
      videoRef.current.currentTime = value
    }
  }

  function captureCutStart() {
    const videoElement = videoRef.current
    if (!videoElement) {
      return
    }
    onClipChange({ ...clip, cutStart: roundTime(videoElement.currentTime) })
  }

  function captureCutEnd() {
    const videoElement = videoRef.current
    if (!videoElement) {
      return
    }
    onClipChange({ ...clip, cutEnd: roundTime(videoElement.currentTime) })
  }

  function toggleToVideoEnd(isChecked: boolean) {
    const newCutEnd = isChecked ? undefined : roundTime(video?.duration ?? 0)
    onClipChange({ ...clip, cutEnd: newCutEnd })
  }

  function previewRange() {
    const videoElement = videoRef.current
    if (!videoElement) {
      return
    }
    isPreviewingRef.current = true
    videoElement.currentTime = cutStart
    videoElement.play()
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      className="h-full max-w-none"
      headerStart={
        onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-100 active:text-white"
            aria-label="Back to video list"
          >
            <ChevronLeft size={16} />
          </button>
        )
      }
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="min-h-0 w-full flex-1 rounded bg-slate-950"
          onTimeUpdate={(e) => {
            setCurrentTime(e.currentTarget.currentTime)
            if (isPreviewingRef.current && !isToVideoEnd && e.currentTarget.currentTime >= cutEnd) {
              e.currentTarget.pause()
            }
          }}
          onPause={() => {
            isPreviewingRef.current = false
          }}
        />
      ) : (
        <div className="flex-1" />
      )}

      {video && (
        <ClipTrimBar
          duration={video.duration}
          cutStart={cutStart}
          cutEnd={cutEnd ?? video.duration}
          isToVideoEnd={isToVideoEnd}
          currentTime={currentTime}
          onRangeChange={(newCutStart, newCutEnd) => {
            let seekTarget: number | null = null
            const nextClip = { ...clip }
            if (newCutStart !== cutStart) {
              nextClip.cutStart = roundTime(newCutStart)
              seekTarget = newCutStart
            }
            if (newCutEnd !== undefined && newCutEnd !== cutEnd) {
              nextClip.cutEnd = roundTime(newCutEnd)
              seekTarget = newCutEnd
            }
            onClipChange(nextClip)
            if (seekTarget !== null && videoRef.current) {
              videoRef.current.currentTime = seekTarget
            }
          }}
        />
      )}

      <div className="flex items-start gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
          Start ({formatTimestamp(cutStart)})
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              step={0.01}
              value={cutStart}
              onChange={(e) => changeCutStart(Number(e.target.value))}
              className="min-h-10 w-full rounded border border-slate-700 px-2 py-1"
            />
            <button
              type="button"
              onClick={captureCutStart}
              className="min-h-10 shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900 active:bg-slate-950"
            >
              Use current
            </button>
          </div>
        </label>

        <div className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
          End ({isToVideoEnd ? 'video end' : formatTimestamp(cutEnd)})
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              step={0.01}
              value={cutEnd ?? ''}
              disabled={isToVideoEnd}
              onChange={(e) => changeCutEnd(Number(e.target.value))}
              className="min-h-10 w-full rounded border border-slate-700 px-2 py-1 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={captureCutEnd}
              disabled={isToVideoEnd}
              className="min-h-10 shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use current
            </button>
          </div>
          <label className="flex min-h-10 cursor-pointer items-center gap-1.5 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={isToVideoEnd}
              onChange={(e) => toggleToVideoEnd(e.target.checked)}
            />
            To the end of the video
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={previewRange}
          disabled={!videoUrl || !isClipRangeValid(clip)}
          className="mr-auto flex min-h-10 cursor-pointer items-center gap-1.5 rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={14} />
          Preview range
        </button>

        {actions}
      </div>
    </Modal>
  )
}
