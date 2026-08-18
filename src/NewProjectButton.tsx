import { useAtom, useSetAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { ActionButton } from './ActionButton'
import { uniqueName } from './uniqueName'

export function NewProjectButton() {
  const [projects, setProjects] = useAtom(projectsAtom)
  const setSelectedProjectId = useSetAtom(selectedProjectIdAtom)

  function handleClick() {
    const id = crypto.randomUUID()
    const name = uniqueName(
      'Untitled project',
      projects.map((project) => project.name),
    )
    setProjects((prev) => [{ id, name, clips: [] }, ...prev])
    setSelectedProjectId(id)
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
