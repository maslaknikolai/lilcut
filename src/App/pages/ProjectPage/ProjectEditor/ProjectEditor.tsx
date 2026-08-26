import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useSetAtom } from 'jotai'
import { Pause, Play, Redo2, Undo2 } from 'lucide-react'
import { projectsAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { useProjectsUndoRedo } from '@/App/pages/ProjectPage/ProjectEditor/useProjectsUndoRedo'
import { ProjectEditorHotkeysButton } from '@/App/pages/ProjectPage/ProjectEditor/ProjectEditorHotkeysButton'
import { CutHereButton } from '@/App/pages/ProjectPage/ProjectEditor/CutHereButton'
import { updateProject } from '@/App/lib/library'
import { formatTimestamp } from '@/App/lib/formatTimestamp'
import {
  buildPlaybackClips,
  buildTimelineClips,
  findClipIndexAtTime,
  type PlaybackClip,
} from '@/App/lib/projectTimeline'
import { Timeline } from '@/App/pages/ProjectPage/ProjectEditor/Timeline/Timeline'
import type { Video, Project } from '@/App/lib/types'
import { useVideoUrls } from '@/App/pages/ProjectPage/ProjectEditor/useVideoUrls'
import { useKeyPress } from '@/App/lib/useKeyPress'
import { RenderProjectButton } from '@/App/pages/ProjectPage/ProjectEditor/RenderProjectButton'

// find problems by filtering the console for [player]; verbose ticks are
// deliberately not logged — every entry is a transition or a suppressed race
function logPlayer(message: string, ...details: unknown[]) {
  console.debug(`[player] ${message}`, ...details)
}

function arrowSeekStep(event: KeyboardEvent): number {
  if (event.metaKey || event.ctrlKey) {
    return 30
  }
  if (event.shiftKey) {
    return 0.01
  }
  return 1
}

type ProjectEditorProps = {
  project: Project
  videos: Video[]
}

export function ProjectEditor({ project, videos }: ProjectEditorProps) {
  const timelineClips = buildTimelineClips(project.clips, videos)
  const playbackClips = buildPlaybackClips(timelineClips)
  const totalDuration = timelineClips.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)

  const setProjects = useSetAtom(projectsAtom)
  const [projectTime, setProjectTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fitZoomSlot, setFitZoomSlot] = useState<HTMLElement | null>(null)

  const { undo, redo, isUndoAvailable, isRedoAvailable } = useProjectsUndoRedo()

  const currentPlaybackClipIndex = findClipIndexAtTime(playbackClips, projectTime)
  const currentPlaybackClip = playbackClips[currentPlaybackClipIndex]
  const currentTimelineClipIndex = findClipIndexAtTime(timelineClips, projectTime)
  const currentTimelineClip = timelineClips[currentTimelineClipIndex]
  const currentVideo = videos.find((video) => video.opfsName === currentPlaybackClip?.videoOpfsName)

  const usedVideos = videos.filter((video) => project.clips.some((clip) => clip.videoOpfsName === video.opfsName))
  const videoUrls = useVideoUrls(usedVideos)
  const videoUrl = currentVideo ? (videoUrls[currentVideo.opfsName] ?? null) : null

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
  }, [currentPlaybackClip?.id, currentVideo])

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
    // a src swap resets currentTime to 0 and fires timeupdate before the new
    // file's metadata arrives; translating that 0 against the new clip's
    // timings would seek backwards and flip the clip switch into a loop
    if (video.readyState === 0) {
      logPlayer('timeupdate ignored: element mid src-swap (readyState 0)')
      return
    }

    // while a programmatic seek is pending, currentTime still reports the old
    // position — translating it against the new clip's timings would also
    // jump backwards and flip the clip switch
    if (video.seeking) {
      logPlayer('timeupdate ignored: seek in flight', { currentTime: video.currentTime })
      return
    }

    if (video.currentTime >= currentPlaybackClip.cutEnd) {
      const nextPlaybackClip = playbackClips[currentPlaybackClipIndex + 1]
      if (nextPlaybackClip) {
        logPlayer('clip switch', {
          from: currentPlaybackClip.videoOpfsName,
          to: nextPlaybackClip.videoOpfsName,
          isFileSwap: nextPlaybackClip.videoOpfsName !== currentPlaybackClip.videoOpfsName,
          overshoot: video.currentTime - currentPlaybackClip.cutEnd,
        })
        setProjectTime(nextPlaybackClip.projectStart)
      } else {
        logPlayer('end of project: parked and paused')
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
    if (unclampedProjectTime < currentPlaybackClip.projectStart) {
      logPlayer('seek undershot the clip start, clamped', {
        undershoot: currentPlaybackClip.projectStart - unclampedProjectTime,
      })
    }
    setProjectTime(Math.max(currentPlaybackClip.projectStart, unclampedProjectTime))
  }

  //
  const longPressTimeoutRef = useRef<number | null>(null)
  const isLongPressingRef = useRef(false)

  function endLongPress(isClickComing: boolean) {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
    if (isLongPressingRef.current) {
      if (videoRef.current) {
        videoRef.current.playbackRate = 1
      }
      if (!isClickComing) {
        isLongPressingRef.current = false
      }
    }
  }

  function playFromNextPlayableClip() {
    function isPlayable(playbackClip: PlaybackClip) {
      return videos.some((video) => video.opfsName === playbackClip.videoOpfsName)
    }

    const laterPlaybackClips = playbackClips.slice(currentPlaybackClipIndex + 1)
    const nextPlayableClip = laterPlaybackClips.find(isPlayable)
    if (!nextPlayableClip) {
      setIsPlaying(false)
      return
    }

    seekToProjectTime(nextPlayableClip.projectStart)
    setIsPlaying(true)
  }

  function togglePlayback() {
    const video = videoRef.current
    if (!video) {
      playFromNextPlayableClip()
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

  function removeCurrentClip() {
    if (!currentTimelineClip) {
      return
    }
    seekToProjectTime(currentTimelineClip.projectStart)
    setProjects((prev) =>
      updateProject(prev, project.id, (p) => {
        const clips = p.clips.filter((clip) => clip.id !== currentTimelineClip.id)
        return { ...p, clips }
      }),
    )
  }

  function handleArrowPress(event: KeyboardEvent, direction: -1 | 1) {
    if (event.altKey) {
      const targetTimelineClip = timelineClips[currentTimelineClipIndex + direction]
      if (targetTimelineClip) {
        seekToProjectTime(targetTimelineClip.projectStart)
      }
      return
    }
    seekToProjectTime(projectTime + direction * arrowSeekStep(event))
  }

  useKeyPress('Space', togglePlayback)
  useKeyPress('ArrowLeft', (event) => handleArrowPress(event, -1), { isModifierAllowed: true })
  useKeyPress('ArrowRight', (event) => handleArrowPress(event, 1), { isModifierAllowed: true })
  useKeyPress('Backspace', removeCurrentClip)
  useKeyPress('Delete', removeCurrentClip)

  return (
    <>
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4 rounded bg-slate-950">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            onClick={() => {
              if (isLongPressingRef.current) {
                isLongPressingRef.current = false
                return
              }
              togglePlayback()
            }}
            onPointerDown={(e) => {
              e.preventDefault()
              longPressTimeoutRef.current = window.setTimeout(() => {
                isLongPressingRef.current = true
                if (videoRef.current) {
                  videoRef.current.playbackRate = 2
                }
              }, 400)
            }}
            onPointerUp={() => endLongPress(true)}
            onPointerLeave={() => endLongPress(false)}
            onPointerCancel={() => endLongPress(false)}
            onContextMenu={(e) => e.preventDefault()}
            className="max-h-full max-w-full cursor-pointer touch-none select-none"
            onLoadedMetadata={(e) => {
              const timeIntoClip = projectTime - currentPlaybackClip.projectStart
              const fileTime = currentPlaybackClip.cutStart + timeIntoClip
              logPlayer('new src ready: positioning', {
                file: currentPlaybackClip.videoOpfsName,
                fileTime,
                willResume: isPlaying,
              })
              e.currentTarget.currentTime = fileTime
              e.currentTarget.playbackRate = isLongPressingRef.current ? 2 : 1
              // a source switch resets the <video> to paused —
              // resume if playback was running when the previous source ended

              if (isPlaying) {
                e.currentTarget.play()
              }
            }}
            onTimeUpdate={handleVideoTimeUpdate}
            onPlay={() => {
              logPlayer('playing')
              setIsPlaying(true)
            }}
            onPause={(e) => {
              // a src swap resets the element (readyState 0); a pause fired
              // mid-swap is the reset, not the user. A pause flagged `ended`
              // is the old file running out while a clip switch to another
              // file is still committing — also not the user; losing the
              // isPlaying intent there would leave the next file paused
              if (e.currentTarget.readyState !== 0 && !e.currentTarget.ended) {
                logPlayer('paused')
                setIsPlaying(false)
              } else {
                logPlayer('pause ignored: src-swap reset or old file ran out', {
                  readyState: e.currentTarget.readyState,
                  ended: e.currentTarget.ended,
                })
              }
            }}
          />
        ) : (
          <span className="text-slate-400">No clips yet</span>
        )}
      </div>

      <div className="flex flex-col shrink-0 border-t border-slate-700 pt-4 gap-2">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {isUndoAvailable && (
              <GhostButton
                onClick={() => undo()}
                tooltip="Undo (Ctrl/⌘+Z)"
                aria-label="Undo"
                className="shrink-0 px-2"
              >
                <Undo2 size={14} />
              </GhostButton>
            )}
            {isRedoAvailable && (
              <GhostButton
                onClick={() => redo()}
                tooltip="Redo (Ctrl/⌘+Shift+Z)"
                aria-label="Redo"
                className="shrink-0 px-2"
              >
                <Redo2 size={14} />
              </GhostButton>
            )}
          </div>

          <RenderProjectButton project={project} />
        </div>
        <div className="flex items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  // space global Space hotkey
                  e.currentTarget.blur()
                  togglePlayback()
                }}
                disabled={timelineClips.length === 0}
                className="flex shrink-0 cursor-pointer items-center justify-center rounded p-1.5 text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>

            <ProjectEditorHotkeysButton />
          </div>

          <div className="flex items-center gap-2">
            <div
              ref={setFitZoomSlot}
              className="flex shrink-0 empty:hidden"
            />

            <CutHereButton
              project={project}
              projectTime={projectTime}
              currentTimelineClip={currentTimelineClip}
            />
          </div>
        </div>

        <Timeline
          project={project}
          currentTimelineClipId={currentTimelineClip?.id}
          projectTime={projectTime}
          onSeek={seekToProjectTime}
          fitZoomSlot={fitZoomSlot}
        />
      </div>
    </>
  )
}
