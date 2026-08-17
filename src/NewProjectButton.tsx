import { useSetAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { projectsAtom, selectedProjectIdAtom } from './atoms'

export function NewProjectButton() {
  const setProjects = useSetAtom(projectsAtom)
  const setSelectedProjectId = useSetAtom(selectedProjectIdAtom)

  function handleClick() {
    const id = crypto.randomUUID()
    setProjects((prev) => [{ id, name: 'Untitled project', clips: [] }, ...prev])
    setSelectedProjectId(id)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
    >
      <Plus size={14} /> New project
    </button>
  )
}
