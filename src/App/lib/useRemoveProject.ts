import { useSetAtom } from 'jotai'
import { libraryOrderAtom, projectsAtom } from '@/App/atoms'
import { useRedirectAfterRemove } from '@/App/lib/useRedirectAfterRemove'

export function useRemoveProject() {
  const setProjects = useSetAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const redirectAfterRemove = useRedirectAfterRemove()

  return function removeProject(projectId: string) {
    setProjects((prev) => prev.filter((item) => item.id !== projectId))
    setLibraryOrder((prev) => prev.filter((id) => id !== projectId))
    redirectAfterRemove(projectId)
  }
}
