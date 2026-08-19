import { useEffect, useEffectEvent } from 'react'
import { useSetAtom } from 'jotai'
import { mediaAssetsAtom } from './atoms'
import { listOpfsMediaAssets } from './opfs'

// loads the OPFS media assets into mediaAssetsAtom once on mount; every
// mutation after that refreshes itself via useMediaAssetActions
export function useSyncMediaAssets(): void {
  const setMediaAssets = useSetAtom(mediaAssetsAtom)

  const loadMediaAssets = useEffectEvent(() => {
    listOpfsMediaAssets().then(setMediaAssets)
  })

  useEffect(() => {
    loadMediaAssets()
  }, [])
}
