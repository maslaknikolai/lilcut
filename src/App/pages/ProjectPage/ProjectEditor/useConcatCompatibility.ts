import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { isConcatCompatible } from '@/App/contexts/isConcatCompatible'
import type { PlaybackClip } from '@/App/lib/projectTimeline'

export type ConcatCompatibility = 'probing' | 'probeFailed' | 'compatible' | 'incompatible'

// probing is heavy (the whole file is fed to ffprobe), so a clip-list change
// first resets to 'probing' and only probes after a long quiet pause
const PROBE_DEBOUNCE_MS = 1500

export function useConcatCompatibility(playbackClips: PlaybackClip[]): ConcatCompatibility {
  const uniqueOpfsNames = [...new Set(playbackClips.map((playbackClip) => playbackClip.mediaAssetOpfsName))]
  const uniqueOpfsNamesKey = uniqueOpfsNames.join('\n')
  const [concatCompatibility, setConcatCompatibility] = useState<ConcatCompatibility>('probing')
  const probeTokenRef = useRef(0)

  const probeConcatCompatibility = useEffectEvent(async () => {
    const token = ++probeTokenRef.current
    try {
      const result = await isConcatCompatible(uniqueOpfsNames)
      if (probeTokenRef.current === token) {
        setConcatCompatibility(result ? 'compatible' : 'incompatible')
      }
    } catch {
      if (probeTokenRef.current === token) {
        setConcatCompatibility('probeFailed')
      }
    }
  })

  const scheduleProbe = useEffectEvent(() => {
    probeTokenRef.current++
    setConcatCompatibility('probing')
    const probeTimer = setTimeout(() => probeConcatCompatibility(), PROBE_DEBOUNCE_MS)
    return () => clearTimeout(probeTimer)
  })

  useEffect(() => scheduleProbe(), [uniqueOpfsNamesKey])

  return concatCompatibility
}
