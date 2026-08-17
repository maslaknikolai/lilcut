import { useAtomValue } from 'jotai'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { ProjectsSidebar } from './ProjectsSidebar'

export function ProjectsPage() {
  const projects = useAtomValue(projectsAtom)
  const selectedProjectId = useAtomValue(selectedProjectIdAtom)
  const selected = projects.find((project) => project.id === selectedProjectId)

  return (
    <>
      <ProjectsSidebar />
      <div className="flex flex-1 items-center justify-center text-neutral-600">
        {selected ? selected.name : 'Create your first project'}
      </div>
    </>
  )
}
