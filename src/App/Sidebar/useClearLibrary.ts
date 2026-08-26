import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { libraryOrderAtom, videosAtom, projectsAtom } from '@/App/atoms'
import { deleteOpfsFile } from '@/App/lib/opfs'
import { useVideoActions } from '@/App/lib/useVideoActions'

export function useClearLibrary() {
  const videos = useAtomValue(videosAtom)
  const setProjects = useSetAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const { refreshVideos } = useVideoActions()
  const [isClearing, setIsClearing] = useState(false)

  async function clearLibrary() {
    if (!confirm('Delete all projects and video files? This cannot be undone.')) {
      return
    }
    setIsClearing(true)
    try {
      for (const video of videos) {
        await deleteOpfsFile(video.opfsName)
      }
      setProjects([])
      setLibraryOrder([])
      await refreshVideos()
    } finally {
      setIsClearing(false)
    }
  }

  return { clearLibrary, isClearing }
}
