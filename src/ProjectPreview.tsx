import { useEffect, useEffectEvent, useRef, useState, type MouseEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Pause, Play, X } from 'lucide-react'
import { mediaFilesAtom, projectsAtom } from './atoms'
import { ExportProjectButton } from './ExportProjectButton'
import { formatTimestamp } from './formatTimestamp'
import { readOpfsFile } from './opfs'
import type { Project } from './types'

type TimelineClip = {
  id: string
  mediaFileId: string
  cutStart: number
  cutEnd: number
  duration: number
  projectStart: number
}

function buildTimeline(project: Project): TimelineClip[] {
  let projectStart = 0
  return project.clips.map((clip) => {
    const cutStart = clip.cutStart ?? 0
    const cutEnd = clip.cutEnd ?? cutStart
    const duration = Math.max(0, cutEnd - cutStart)
    const timelineClip = {
      id: clip.id,
      mediaFileId: clip.mediaFileId,
      cutStart,
      cutEnd,
      duration,
      projectStart,
    }
    projectStart += duration
    return timelineClip
  })
}

function findClipIndexAtTime(timeline: TimelineClip[], time: number): number {
  for (let i = 0; i < timeline.length; i++) {
    if (time < timeline[i].projectStart + timeline[i].duration) {
      return i
    }
  }
  return Math.max(0, timeline.length - 1)
}

type ProjectPreviewProps = {
  project: Project
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const setProjects = useSetAtom(projectsAtom)
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

  function handleTimelineClick(event: MouseEvent<HTMLDivElement>) {
    if (totalDuration <= 0) {
      return
    }
    const track = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - track.left) / track.width
    seekToProjectTime(Math.min(1, Math.max(0, ratio)) * totalDuration)
  }

  function removeClip(event: MouseEvent<HTMLButtonElement>, clipId: string) {
    event.stopPropagation()
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, clips: p.clips.filter((clip) => clip.id !== clipId) } : p,
      ),
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-neutral-600">No clips yet</div>
    )
  }

  const playheadPercent = totalDuration > 0 ? (projectTime / totalDuration) * 100 : 0

  return (
    <div className="flex w-full flex-1 flex-col gap-2">
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {videoUrl && (
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
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlayback}
          className="flex shrink-0 items-center justify-center rounded p-1.5 text-neutral-700 hover:bg-neutral-100"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>

        <span className="w-24 shrink-0 text-xs text-neutral-500">
          {formatTimestamp(projectTime)} / {formatTimestamp(totalDuration)}
        </span>

        <div className="flex-1" />

        <ExportProjectButton project={project} />
      </div>

      <div className="flex flex-col gap-1">
        <div
          onClick={handleTimelineClick}
          className="relative h-1.5 cursor-pointer rounded-full bg-neutral-300"
        >
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-neutral-900"
            style={{ left: `${playheadPercent}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        <div onClick={handleTimelineClick} className="flex h-12 cursor-pointer gap-px">
          {timeline.map((timelineClip) => (
            <div
              key={timelineClip.id}
              style={{ flexGrow: timelineClip.duration || 1 }}
              className={`group relative flex min-w-0 items-center overflow-hidden rounded px-2 text-xs font-medium text-white ${
                timelineClip.id === currentClipId ? 'bg-neutral-900' : 'bg-neutral-500'
              }`}
            >
              <span className="truncate">
                {mediaFiles.find((file) => file.id === timelineClip.mediaFileId)?.name ??
                  'Unknown file'}
              </span>

              <button
                type="button"
                onClick={(e) => removeClip(e, timelineClip.id)}
                className="absolute top-0.5 right-0.5 rounded p-0.5 opacity-0 hover:bg-black/30 group-hover:opacity-100"
                aria-label="Remove clip"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
