import { useAtom, useSetAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { libraryOrderAtom, projectsAtom, selectedLibraryItemIdAtom } from './atoms'
import { ActionButton } from './ActionButton'
import { uniqueName } from './uniqueName'

export function NewProjectButton() {
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const setSelectedLibraryItemId = useSetAtom(selectedLibraryItemIdAtom)

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
      className="bg-neutral-900 text-white hover:bg-neutral-800"
    >
      <Plus size={14} />
    </ActionButton>
  )
}
