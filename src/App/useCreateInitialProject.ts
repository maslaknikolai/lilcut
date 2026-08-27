import { useEffect, useEffectEvent } from 'react'
import { useLibraryItems } from '@/App/lib/library'
import { useCreateProject } from '@/App/lib/useCreateProject'

export function useCreateInitialProject(isLibraryLoaded: boolean): void {
  const library = useLibraryItems()
  const createProject = useCreateProject()

  const createIfLibraryEmpty = useEffectEvent(() => {
    if (!library.length) {
      createProject()
    }
  })

  useEffect(() => {
    if (isLibraryLoaded) {
      createIfLibraryEmpty()
    }
  }, [isLibraryLoaded])
}
