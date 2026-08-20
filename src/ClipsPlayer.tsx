import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { ConcatCompatibilityBadge } from './ConcatCompatibilityBadge'
import { CutHereButton } from './CutHereButton'
import { ExportProjectButton } from './ExportProjectButton'
import { formatTimestamp } from './formatTimestamp'
import { buildPlaybackClips, buildTimelineClips, findClipIndexAtTime } from './projectTimeline'
import { Timeline } from './Timeline'
import type { MediaAsset, Project } from './types'
import { useMediaAssetVideoUrls } from './useMediaAssetVideoUrls'

type ClipsPlayerProps = {
  project: Project
  mediaAssets: MediaAsset[]
}

export function ClipsPlayer({ project, mediaAssets }: ClipsPlayerProps) {
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

  const usedMediaAssets = mediaAssets.filter((mediaAsset) =>
    project.clips.some((clip) => clip.mediaAssetOpfsName === mediaAsset.opfsName),
  )
  const videoUrls = useMediaAssetVideoUrls(usedMediaAssets)
  const videoUrl = currentMediaAsset ? (videoUrls[currentMediaAsset.opfsName] ?? null) : null

  const applyPendingSeek = useEffectEvent(() => {
    const video = videoRef.current
    if (!video || !currentPlaybackClip) {
      return
    }
    // a src swap just reset the element — seeking or playing now would be
    // aborted by the load in progress; onLoadedMetadata positions and resumes
    if (video.readyState === 0) {
      return
    }
    const timeIntoClip = projectTime - currentPlaybackClip.projectStart
    const fileTime = currentPlaybackClip.cutStart + timeIntoClip
    video.currentTime = fileTime
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
      const timeIntoClip = clampedTime - playbackClip.projectStart
      const fileTime = playbackClip.cutStart + timeIntoClip
      videoRef.current.currentTime = fileTime
    }
  }

  function handleVideoTimeUpdate() {
    const video = videoRef.current

    if (!video || !currentPlaybackClip) {
      return
    }
    console.log('WIPWIP handleVideoTimeUpdate', video.readyState, video.currentTime)
    // a src swap resets currentTime to 0 and fires timeupdate before the new
    // file's metadata arrives; translating that 0 against the new clip's
    // timings would seek backwards and flip the clip switch into a loop
    if (video.readyState === 0) {
      return
    }

    // while a programmatic seek is pending, currentTime still reports the old
    // position — translating it against the new clip's timings would also
    // jump backwards and flip the clip switch
    if (video.seeking) {
      return
    }

    if (video.currentTime >= currentPlaybackClip.cutEnd) {
      const nextPlaybackClip = playbackClips[currentPlaybackClipIndex + 1]
      if (nextPlaybackClip) {
        console.log('WIPWIP handleVideoTimeUpdate nextPlaybackClip', nextPlaybackClip, currentPlaybackClip)
        setProjectTime(nextPlaybackClip.projectStart)
      } else {
        const clipEndProjectTime = currentPlaybackClip.projectStart + currentPlaybackClip.duration
        setProjectTime(clipEndProjectTime)
        video.pause()
        // set directly: if the file ran out before this handler, the pause
        // event already fired flagged as `ended` and onPause ignored it
        setIsPlaying(false)
      }
      return
    }

    // seeks land on frame boundaries, often a few ms EARLIER than requested —
    // translated as-is that undershoot puts projectTime just before the clip,
    // findClipIndexAtTime flips back to the previous clip and the switch
    // loops; clamping to the clip's start makes the flip impossible
    const timeIntoClip = video.currentTime - currentPlaybackClip.cutStart
    const unclampedProjectTime = currentPlaybackClip.projectStart + timeIntoClip
    setProjectTime(Math.max(currentPlaybackClip.projectStart, unclampedProjectTime))
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
    <>
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-h-full max-w-full"
            onLoadedMetadata={(e) => {
              console.log(
                'WIPWIP onLoadedMetadata',
                currentPlaybackClip,
                projectTime,
                e.currentTarget.currentTime,
                isPlaying,
              )
              const timeIntoClip = projectTime - currentPlaybackClip.projectStart
              const fileTime = currentPlaybackClip.cutStart + timeIntoClip
              e.currentTarget.currentTime = fileTime
              // a source switch resets the <video> to paused —
              // resume if playback was running when the previous source ended

              if (isPlaying) {
                e.currentTarget.play()
              }
            }}
            onTimeUpdate={handleVideoTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={(e) => {
              // a src swap resets the element (readyState 0); a pause fired
              // mid-swap is the reset, not the user. A pause flagged `ended`
              // is the old file running out while a clip switch to another
              // file is still committing — also not the user; losing the
              // isPlaying intent there would leave the next file paused
              if (e.currentTarget.readyState !== 0 && !e.currentTarget.ended) {
                setIsPlaying(false)
              }
            }}
          />
        ) : (
          <span className="text-slate-400">No clips yet</span>
        )}
      </div>

      <div className="flex items-center gap-2 px-4">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={timelineClips.length === 0}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded p-1.5 text-slate-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
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

        <span className="shrink-0 text-xs text-slate-500">
          {formatTimestamp(projectTime)} / {formatTimestamp(totalDuration)}
        </span>

        <CutHereButton
          project={project}
          projectTime={projectTime}
          currentTimelineClip={currentTimelineClip}
        />

        <div className="flex-1" />

        <ExportProjectButton project={project} />
        <ConcatCompatibilityBadge playbackClips={playbackClips} />
      </div>

      <Timeline
        project={project}
        currentTimelineClipId={currentTimelineClip?.id}
        projectTime={projectTime}
        onSeek={seekToProjectTime}
      />
    </>
  )
}
