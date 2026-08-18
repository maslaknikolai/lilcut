import { useSetAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { SidebarActionButton } from './SidebarActionButton'

export function NewProjectButton() {
  const setProjects = useSetAtom(projectsAtom)
  const setSelectedProjectId = useSetAtom(selectedProjectIdAtom)

  function handleClick() {
    const id = crypto.randomUUID()
    setProjects((prev) => [{ id, name: 'Untitled project', clips: [] }, ...prev])
    setSelectedProjectId(id)
  }

  return (
    <SidebarActionButton onClick={handleClick} className="bg-neutral-900 text-white hover:bg-neutral-800">
      <Plus size={14} />
    </SidebarActionButton>
  )
}
