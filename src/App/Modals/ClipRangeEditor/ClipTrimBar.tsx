import { Slider } from '@/App/lib/ui/slider'
import { cn } from '@/App/lib/utils'

type ClipTrimBarProps = {
  duration: number
  cutStart: number
  cutEnd: number
  isToVideoEnd: boolean
  currentTime: number
  onRangeChange: (cutStart: number, cutEnd: number | undefined) => void
}

export function ClipTrimBar({
  duration,
  cutStart,
  cutEnd,
  isToVideoEnd,
  currentTime,
  onRangeChange,
}: ClipTrimBarProps) {
  if (duration <= 0) {
    return null
  }

  const values = isToVideoEnd ? [cutStart] : [cutStart, cutEnd]
  const playheadFraction = Math.min(1, Math.max(0, currentTime / duration))

  function handleValueChange(newValues: number[]) {
    onRangeChange(newValues[0], newValues[1])
  }

  return (
    <div className="relative shrink-0 py-1">
      <Slider
        value={values}
        min={0}
        max={duration}
        step={0.01}
        minStepsBetweenThumbs={1}
        onValueChange={handleValueChange}
        className={cn(isToVideoEnd && '**:data-[slot=slider-track]:bg-primary **:data-[slot=slider-range]:bg-muted')}
      />
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-white"
        style={{ left: `${playheadFraction * 100}%` }}
      />
    </div>
  )
}
