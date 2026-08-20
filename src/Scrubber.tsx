import { type MouseEvent } from 'react'

type ScrubberProps = {
  projectTime: number
  totalDuration: number
  onSeek: (time: number) => void
}

export function Scrubber({ projectTime, totalDuration, onSeek }: ScrubberProps) {
  const playheadPercent = totalDuration > 0 ? (projectTime / totalDuration) * 100 : 0

  function handleSeekStart(event: MouseEvent<HTMLDivElement>) {
    if (totalDuration <= 0) {
      return
    }
    event.preventDefault()

    const track = event.currentTarget.getBoundingClientRect()

    function seekToClientX(clientX: number) {
      const ratio = (clientX - track.left) / track.width
      onSeek(Math.min(1, Math.max(0, ratio)) * totalDuration)
    }

    function handleMouseMove(moveEvent: globalThis.MouseEvent) {
      seekToClientX(moveEvent.clientX)
    }
    function handleMouseUp() {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    seekToClientX(event.clientX)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleSeekStart}
      className="relative grow-0 shrink-0 h-4 cursor-pointer overflow-hidden rounded-full bg-slate-700"
    >
      <div
        className="absolute inset-y-0 left-0 bg-blue-600"
        style={{ width: `${playheadPercent}%` }}
      />
    </div>
  )
}
