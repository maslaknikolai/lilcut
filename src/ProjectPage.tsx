import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { Pause, Play } from 'lucide-react'
import { mediaAssetsAtom } from './atoms'
import { ConcatCompatibilityBadge } from './ConcatCompatibilityBadge'
import { ExportProjectButton } from './ExportProjectButton'
import { formatTimestamp } from './formatTimestamp'
import { Scrubber } from './Scrubber'
import { Timeline } from './Timeline'
import { buildPlaybackClips, buildTimelineClips, findClipIndexAtTime } from './projectTimeline'
import type { Project } from './types'
import { useMediaAssetVideoUrl } from './useMediaAssetVideoUrl'
import { CutHereButton } from './CutHereButton'

type ProjectPreviewProps = {
  project: Project
}

export function ProjectPage({ project }: ProjectPreviewProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const timelineClips = buildTimelineClips(project, mediaAssets)
  const playbackClips = buildPlaybackClips(timelineClips)
  const totalDuration = timelineClips.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)

  const [projectTime, setProjectTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentPlaybackClipIndex = findClipIndexAtTime(playbackClips, projectTime)
  const currentPlaybackClip = playbackClips[currentPlaybackClipIndex]
  const currentTimelineClip = timelineClips[findClipIndexAtTime(timelineClips, projectTime)]
  const currentMediaAsset = mediaAssets.find(
    (mediaAsset) => mediaAsset.opfsName === currentPlaybackClip?.mediaAssetOpfsName,
  )
  const videoUrl = useMediaAssetVideoUrl(currentMediaAsset)

  // switching the active clip doesn't reload the <video> element when both
  // clips share the same underlying file, so the jump to the clip's start (or
  // wherever within it projectTime landed) happens here; a clip on a different
  // file remounts the <video> instead (it's unmounted while the new source
  // loads), and onLoadedMetadata does the positioning there
  const applyPendingSeek = useEffectEvent(() => {
    const video = videoRef.current
    if (!video || !currentPlaybackClip) {
      return
    }
    video.currentTime = currentPlaybackClip.cutStart + (projectTime - currentPlaybackClip.projectStart)
    if (isPlaying) {
      video.play()
    }
  })

  useEffect(() => {
    applyPendingSeek()
  }, [currentPlaybackClip?.id, currentMediaAsset])

  function seekToProjectTime(time: number) {
    if (timelineClips.length === 0) {
      return
    }

    const video = videoRef.current
    video?.pause()
    // the pause event won't reach us if the seek remounts the <video> (source
    // switch), so record the intent directly instead of relying on the event
    setIsPlaying(false)

    const clampedTime = Math.min(totalDuration, Math.max(0, time))
    setProjectTime(clampedTime)

    const playbackClip = playbackClips[findClipIndexAtTime(playbackClips, clampedTime)]
    if (playbackClip.id === currentPlaybackClip?.id && videoRef.current) {
      videoRef.current.currentTime = playbackClip.cutStart + (clampedTime - playbackClip.projectStart)
    }
  }

  function handleVideoTimeUpdate() {
    const video = videoRef.current

    if (!video || !currentPlaybackClip) {
      return
    }

    if (video.currentTime >= currentPlaybackClip.cutEnd) {
      const nextPlaybackClip = playbackClips[currentPlaybackClipIndex + 1]
      if (nextPlaybackClip) {
        setProjectTime(nextPlaybackClip.projectStart)
      } else {
        setProjectTime(currentPlaybackClip.projectStart + currentPlaybackClip.duration)
        video.pause()
      }
      return
    }

    setProjectTime(currentPlaybackClip.projectStart + (video.currentTime - currentPlaybackClip.cutStart))
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
              e.currentTarget.currentTime =
                currentPlaybackClip.cutStart + (projectTime - currentPlaybackClip.projectStart)
              // a source switch remounts the <video>, which comes up paused —
              // resume if playback was running when the previous source ended
              if (isPlaying) {
                e.currentTarget.play()
              }
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
          disabled={timelineClips.length === 0}
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

        <CutHereButton
          project={project}
          projectTime={projectTime}
          currentTimelineClip={currentTimelineClip}
        />

        <span className="w-24 shrink-0 text-xs text-neutral-500">
          {formatTimestamp(projectTime)} / {formatTimestamp(totalDuration)}
        </span>

        <ConcatCompatibilityBadge playbackClips={playbackClips} />

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
        currentTimelineClipId={currentTimelineClip?.id}
      />
    </div>
  )
}
