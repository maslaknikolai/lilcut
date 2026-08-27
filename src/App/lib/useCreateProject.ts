import { useAtom, useSetAtom } from 'jotai'
import { libraryOrderAtom, projectsAtom } from '@/App/atoms'
import { uniqueName } from '@/App/lib/uniqueName'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

export function useCreateProject() {
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  return function createProject() {
    const id = crypto.randomUUID()
    const name = uniqueName(
      'Untitled project',
      projects.map((project) => project.name),
    )
    setProjects((prev) => [{ id, name, clips: [] }, ...prev])
    setLibraryOrder((prev) => [id, ...prev])
    setSelectedLibraryItemId(id)
  }
}
