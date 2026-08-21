import { useAtom, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from './atoms'
import { GhostButton } from './GhostButton'
import { uniqueName } from './uniqueName'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

export function NewProjectButton() {
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  function handleClick() {
    const id = crypto.randomUUID()
    const name = uniqueName(
      'Untitled project',
      projects.map((project) => project.name),
    )
    setProjects((prev) => [{ id, name, clips: [] }, ...prev])
    setLibraryOrder((prev) => [id, ...prev])
    setSelectedLibraryItemId(id)
  }

  return (
    <GhostButton onClick={handleClick}>
      <Scissors size={14} className="text-blue-400" />
      <span>New project</span>
    </GhostButton>
  )
}
