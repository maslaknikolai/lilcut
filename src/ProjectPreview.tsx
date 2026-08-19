import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { Pause, Play } from 'lucide-react'
import { mediaAssetsAtom } from './atoms'
import { ExportProjectButton } from './ExportProjectButton'
import { formatTimestamp } from './formatTimestamp'
import { Scrubber } from './Scrubber'
import { Timeline } from './Timeline'
import { buildTimeline, findClipIndexAtTime } from './projectTimeline'
import type { Project } from './types'
import { useMediaAssetVideoUrl } from './useMediaAssetVideoUrl'

type ProjectPreviewProps = {
  project: Project
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const timeline = buildTimeline(project)
  const totalDuration = timeline.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)

  const [projectTime, setProjectTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentClipIndex = findClipIndexAtTime(timeline, projectTime)
  const currentClip = timeline[currentClipIndex]
  const mediaAsset = mediaAssets.find((mediaAsset) => mediaAsset.opfsName === currentClip?.mediaAssetOpfsName)
  const videoUrl = useMediaAssetVideoUrl(mediaAsset)

  // switching the active clip doesn't necessarily reload the <video> element
  // (consecutive clips often share the same underlying file), so the jump to
  // the clip's start (or wherever within it projectTime landed) happens here
  const applyPendingSeek = useEffectEvent(() => {
    const video = videoRef.current
    if (!video || !currentClip) {
      return
    }
    video.currentTime = currentClip.cutStart + (projectTime - currentClip.projectStart)
    if (isPlaying) {
      video.play()
    }
  })

  useEffect(() => {
    applyPendingSeek()
  }, [currentClip?.id, mediaAsset])

  function seekToProjectTime(time: number) {
    if (timeline.length === 0) {
      return
    }
    const clampedTime = Math.min(totalDuration, Math.max(0, time))
    setProjectTime(clampedTime)

    const clip = timeline[findClipIndexAtTime(timeline, clampedTime)]
    if (clip.id === currentClip?.id && videoRef.current) {
      videoRef.current.currentTime = clip.cutStart + (clampedTime - clip.projectStart)
    }
  }

  function handleVideoTimeUpdate() {
    const video = videoRef.current
    if (!video || !currentClip) {
      return
    }
    if (video.currentTime >= currentClip.cutEnd) {
      const nextClip = timeline[currentClipIndex + 1]
      if (nextClip) {
        setProjectTime(nextClip.projectStart)
      } else {
        video.currentTime = currentClip.cutEnd
        video.pause()
      }
      return
    }
    setProjectTime(currentClip.projectStart + (video.currentTime - currentClip.cutStart))
  }

  function togglePlayback() {
    const video = videoRef.current
    if (!video) {
      return
    }
    if (video.paused) {
      if (projectTime >= totalDuration) {
        seekToProjectTime(0)
      }
      video.play()
    } else {
      video.pause()
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-h-full max-w-full"
            onLoadedMetadata={(e) => {
              e.currentTarget.currentTime = currentClip.cutStart + (projectTime - currentClip.projectStart)
            }}
            onTimeUpdate={handleVideoTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <span className="text-neutral-600">No clips yet</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={timeline.length === 0}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded p-1.5 text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause
              size={16}
              fill="currentColor"
            />
          ) : (
            <Play
              size={16}
              fill="currentColor"
            />
          )}
        </button>

        <span className="w-24 shrink-0 text-xs text-neutral-500">
          {formatTimestamp(projectTime)} / {formatTimestamp(totalDuration)}
        </span>

        <div className="flex-1" />

        <ExportProjectButton project={project} />
      </div>

      <Scrubber
        projectTime={projectTime}
        totalDuration={totalDuration}
        onSeek={seekToProjectTime}
      />

      <Timeline
        project={project}
        currentClipId={currentClip?.id ?? null}
      />
    </div>
  )
}
