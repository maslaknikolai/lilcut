import { useAtomValue } from 'jotai'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { ProjectEditor } from './ProjectEditor'
import { ProjectsSidebar } from './ProjectsSidebar'

export function ProjectsPage() {
  const projects = useAtomValue(projectsAtom)
  const selectedProjectId = useAtomValue(selectedProjectIdAtom)
  const selected = projects.find((project) => project.id === selectedProjectId)

  return (
    <>
      <ProjectsSidebar />
      {selected ? (
        <ProjectEditor key={selected.id} project={selected} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-neutral-600">
          Create your first project
        </div>
      )}
    </>
  )
}
