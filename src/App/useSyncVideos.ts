import { useEffect, useEffectEvent, useState } from 'react'
import { useSetAtom } from 'jotai'
import { videosAtom } from '@/App/atoms'
import { listOpfsVideos } from '@/App/lib/opfs'

export function useSyncVideos(): boolean {
  const setVideos = useSetAtom(videosAtom)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadVideos = useEffectEvent(() => {
    listOpfsVideos().then((videos) => {
      setVideos(videos)
      setIsLoaded(true)
    })
  })

  useEffect(() => {
    loadVideos()
  }, [])

  return isLoaded
}
