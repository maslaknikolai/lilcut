import { useEffect, useEffectEvent } from 'react'
import { useSetAtom } from 'jotai'
import { videosAtom } from '@/App/atoms'
import { listOpfsVideos } from '@/App/lib/opfs'

// loads the OPFS videos into videosAtom once on mount; every
// mutation after that refreshes itself via useVideoActions
export function useSyncVideos(): void {
  const setVideos = useSetAtom(videosAtom)

  const loadVideos = useEffectEvent(() => {
    listOpfsVideos().then(setVideos)
  })

  useEffect(() => {
    loadVideos()
  }, [])
}
