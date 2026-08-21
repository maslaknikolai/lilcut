import { type PointerEvent } from 'react'

type ScrubberProps = {
  projectTime: number
  totalDuration: number
  onSeek: (time: number) => void
}

export function Scrubber({ projectTime, totalDuration, onSeek }: ScrubberProps) {
  const playheadPercent = totalDuration > 0 ? (projectTime / totalDuration) * 100 : 0

  function seekToClientX(track: HTMLDivElement, clientX: number) {
    const rect = track.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    onSeek(Math.min(1, Math.max(0, ratio)) * totalDuration)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (totalDuration <= 0) {
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
      className="relative grow-0 shrink-0 h-4 cursor-pointer touch-none overflow-hidden rounded-full bg-slate-700"
    >
      <div
        className="absolute inset-y-0 left-0 bg-blue-600"
        style={{ width: `${playheadPercent}%` }}
      />
    </div>
  )
}
