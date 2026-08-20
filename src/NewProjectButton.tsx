import { useAtom, useSetAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from './atoms'
import { ActionButton } from './ActionButton'
import { uniqueName } from './uniqueName'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

type NewProjectButtonProps = {
  isWithLabel?: boolean
}

export function NewProjectButton({ isWithLabel }: NewProjectButtonProps) {
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
    <ActionButton
      onClick={handleClick}
      className="bg-blue-500 text-white hover:bg-blue-600"
    >
      <Plus size={14} />
      {isWithLabel && <span>New project</span>}
    </ActionButton>
  )
}
