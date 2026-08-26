import { type PointerEvent } from 'react'
import { getTimelineTime, getTimelineX, type TimelineClip } from '@/App/lib/projectTimeline'

type ScrubberProps = {
  timelineClips: TimelineClip[]
  projectTime: number
  pxPerSecond: number
  onSeek: (time: number) => void
}

export function Scrubber({ timelineClips, projectTime, pxPerSecond, onSeek }: ScrubberProps) {
  const playheadX = getTimelineX(timelineClips, projectTime, pxPerSecond)

  function seekToClientX(track: HTMLDivElement, clientX: number) {
    const trackRect = track.getBoundingClientRect()
    const xOnTrack = clientX - trackRect.left
    const time = getTimelineTime(timelineClips, xOnTrack, pxPerSecond)
    onSeek(time)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!timelineClips.length) {
      return
    }
    // also suppresses the compatibility mousedown that would start
    // DragScrollArea's panning
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    seekToClientX(event.currentTarget, event.clientX)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }
    seekToClientX(event.currentTarget, event.clientX)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      className="relative grow-0 shrink-0 h-6 cursor-pointer touch-none rounded-full bg-slate-700 md:h-4"
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
        style={{ width: playheadX }}
      />
    </div>
  )
}
