import type { PlaybackClip } from './projectTimeline'
import { useIsConcatCompatible } from './useIsConcatCompatible'

type ConcatCompatibilityBadgeProps = {
  playbackClips: PlaybackClip[]
}

export function ConcatCompatibilityBadge({ playbackClips }: ConcatCompatibilityBadgeProps) {
  const isConcatCompatible = useIsConcatCompatible(playbackClips)

  if (playbackClips.length === 0 || isConcatCompatible === null) {
    return null
  }

  return (
    <span
      className={`shrink-0 text-xs ${isConcatCompatible ? 'text-green-400' : 'text-amber-400'}`}
      title={
        isConcatCompatible
          ? 'All clips share codec, resolution, and audio parameters — export copies streams without re-encoding'
          : 'Clips have mismatched stream parameters — stream-copy export may produce a broken file'
      }
    >
      {isConcatCompatible ? '● lossless' : '● mixed formats'}
    </span>
  )
}
