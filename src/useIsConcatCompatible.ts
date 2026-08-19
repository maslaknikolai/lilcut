import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { getFormatSignature } from './getFormatSignature'
import type { PlaybackClip } from './projectTimeline'

// null while probing (or if the probe failed) — hide the indicator then
export function useIsConcatCompatible(playbackClips: PlaybackClip[]): boolean | null {
  const uniqueOpfsNames = [...new Set(playbackClips.map((playbackClip) => playbackClip.mediaAssetOpfsName))]
  const uniqueOpfsNamesKey = uniqueOpfsNames.join('\n')
  const [isConcatCompatible, setIsConcatCompatible] = useState<boolean | null>(null)
  const probeTokenRef = useRef(0)

  const probeConcatCompatibility = useEffectEvent(async () => {
    const token = ++probeTokenRef.current

    if (uniqueOpfsNames.length <= 1) {
      setIsConcatCompatible(true)
      return
    }

    setIsConcatCompatible(null)
    try {
      const signatures = await Promise.all(uniqueOpfsNames.map(getFormatSignature))
      if (probeTokenRef.current === token) {
        const isEverySignatureEqual = new Set(signatures).size <= 1
        setIsConcatCompatible(isEverySignatureEqual)
      }
    } catch {
      // probe failure: leave the badge hidden rather than claim either way
    }
  })

  useEffect(() => {
    probeConcatCompatibility()
  }, [uniqueOpfsNamesKey])

  return isConcatCompatible
}
