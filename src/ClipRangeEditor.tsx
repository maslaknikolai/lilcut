import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue } from 'jotai'
import { ChevronLeft, Play, X } from 'lucide-react'
import { mediaAssetsAtom } from './atoms'
import { ClipTrimBar } from './ClipTrimBar'
import { formatTimestamp } from './formatTimestamp'
import { isClipRangeValid } from './projectTimeline'
import { readOpfsFile } from './opfs'
import type { Clip } from './types'

function roundTime(time: number): number {
  return Math.round(time * 100) / 100
}
type ClipRangeEditorProps = {
  clip: Clip
  title: string
  onClipChange: (clip: Clip) => void
  // footer buttons — each caller decides what accepting the draft means
  actions: ReactNode
  onBack?: () => void
  onClose: () => void
  children?: ReactNode
}

export function ClipRangeEditor({
  clip,
  title,
  onClipChange,
  actions,
  onBack,
  onClose,
  children,
}: ClipRangeEditorProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isPreviewingRef = useRef(false)

  const mediaAsset = mediaAssets.find((item) => item.opfsName === clip.mediaAssetOpfsName)

  const cutStart = clip.cutStart ?? 0
  const cutEnd = clip.cutEnd
  const isToVideoEnd = cutEnd === undefined

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
    const video = videoRef.current
    if (!video) {
      return
    }
    onClipChange({ ...clip, cutStart: roundTime(video.currentTime) })
  }

  function captureCutEnd() {
    const video = videoRef.current
    if (!video) {
      return
    }
    onClipChange({ ...clip, cutEnd: roundTime(video.currentTime) })
  }

  function toggleToVideoEnd(isChecked: boolean) {
    const newCutEnd = isChecked ? undefined : roundTime(mediaAsset?.duration ?? 0)
    onClipChange({ ...clip, cutEnd: newCutEnd })
  }

  function previewRange() {
    const video = videoRef.current
    if (!video) {
      return
    }
    isPreviewingRef.current = true
    video.currentTime = cutStart
    video.play()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col gap-3 rounded bg-slate-800 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="touch-target cursor-pointer text-slate-500 hover:text-slate-100 active:text-white"
                aria-label="Back to video list"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <span className="text-sm font-semibold text-slate-100">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target cursor-pointer text-slate-500 hover:text-slate-100 active:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {children}

        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="min-h-0 w-full flex-1"
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

        {mediaAsset && (
          <ClipTrimBar
            duration={mediaAsset.duration}
            cutStart={cutStart}
            cutEnd={cutEnd ?? mediaAsset.duration}
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
                className="touch-target shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900 active:bg-slate-950"
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
                className="touch-target shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Use current
              </button>
            </div>
            <label className="touch-target flex cursor-pointer items-center gap-1.5 text-xs text-slate-400">
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
            className="touch-target mr-auto flex cursor-pointer items-center gap-1.5 rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={14} />
            Preview range
          </button>

          {actions}
        </div>
      </div>
    </div>
  )
}
