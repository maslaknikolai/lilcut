import { useAtom, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { uniqueName } from '@/App/lib/uniqueName'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

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
      <Scissors
        size={14}
        className="text-blue-400"
      />
      <span>New project</span>
    </GhostButton>
  )
}
