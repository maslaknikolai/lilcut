import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { Pause, Play } from 'lucide-react'
import { mediaFilesAtom } from './atoms'
import { ExportProjectButton } from './ExportProjectButton'
import { formatTimestamp } from './formatTimestamp'
import { readOpfsFile } from './opfs'
import { Timeline } from './Timeline'
import { buildTimeline, findClipIndexAtTime } from './projectTimeline'
import type { Project } from './types'

type ProjectPreviewProps = {
  project: Project
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const timeline = buildTimeline(project)
  const totalDuration = timeline.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)

  const [currentClipId, setCurrentClipId] = useState(timeline[0]?.id ?? null)
  const [projectTime, setProjectTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pendingOffsetRef = useRef(0)

  const currentClipIndex = timeline.findIndex((timelineClip) => timelineClip.id === currentClipId)
  const currentClip = timeline[currentClipIndex]
  const mediaFile = mediaFiles.find((file) => file.id === currentClip?.mediaFileId)

  // deleting the currently playing clip means currentClipId no longer
  // matches anything in the timeline — fall back to the first remaining clip
  const syncCurrentClip = useEffectEvent(() => {
    if (timeline.some((timelineClip) => timelineClip.id === currentClipId)) {
      return
    }
    pendingOffsetRef.current = 0
    setCurrentClipId(timeline[0]?.id ?? null)
  })

  useEffect(() => {
    syncCurrentClip()
  }, [project])

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

  // switching the active clip doesn't necessarily reload the <video> element
  // (consecutive clips often share the same underlying file), so the jump to
  // the clip's start (or a pending seek offset within it) happens here
  const applyPendingSeek = useEffectEvent(() => {
    const video = videoRef.current
    if (!video || !currentClip) {
      return
    }
    video.currentTime = currentClip.cutStart + pendingOffsetRef.current
    pendingOffsetRef.current = 0
    if (isPlaying) {
      video.play()
    }
  })

  useEffect(() => {
    applyPendingSeek()
  }, [currentClipId, mediaFile])

  function seekToProjectTime(time: number) {
    if (timeline.length === 0) {
      return
    }
    const clampedTime = Math.min(totalDuration, Math.max(0, time))
    const index = findClipIndexAtTime(timeline, clampedTime)
    const clip = timeline[index]
    const offsetWithinClip = clampedTime - clip.projectStart

    setProjectTime(clampedTime)
    if (clip.id === currentClipId && videoRef.current) {
      videoRef.current.currentTime = clip.cutStart + offsetWithinClip
    } else {
      pendingOffsetRef.current = offsetWithinClip
      setCurrentClipId(clip.id)
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video || !currentClip) {
      return
    }
    if (video.currentTime >= currentClip.cutEnd) {
      const nextClip = timeline[currentClipIndex + 1]
      if (nextClip) {
        pendingOffsetRef.current = 0
        setCurrentClipId(nextClip.id)
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
              e.currentTarget.currentTime = currentClip.cutStart + pendingOffsetRef.current
              pendingOffsetRef.current = 0
            }}
            onTimeUpdate={handleTimeUpdate}
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
          className="flex shrink-0 items-center justify-center rounded p-1.5 text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
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

      <Timeline
        project={project}
        currentClipId={currentClipId}
        projectTime={projectTime}
        onSeek={seekToProjectTime}
      />
    </div>
  )
}
