import { useAtomValue } from 'jotai'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { ProjectPreview } from './ProjectPreview'
import { ProjectsSidebar } from './ProjectsSidebar'

export function ProjectsPage() {
  const projects = useAtomValue(projectsAtom)
  const selectedProjectId = useAtomValue(selectedProjectIdAtom)
  const selected = projects.find((project) => project.id === selectedProjectId)

  return (
    <>
      <ProjectsSidebar />
      {selected ? (
        <div
          key={selected.id}
          className="flex flex-1 flex-col p-4"
        >
          <ProjectPreview project={selected} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-neutral-600">Create your first project</div>
      )}
    </>
  )
}
