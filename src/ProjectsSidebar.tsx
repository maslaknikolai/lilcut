import { useEffect, useEffectEvent } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { NewProjectButton } from './NewProjectButton'
import { ProjectItem } from './ProjectItem'

export function ProjectsSidebar() {
  const projects = useAtomValue(projectsAtom)
  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom)

  // keep a valid selection: autoselect the first project, and reselect
  // after the selected one is deleted
  const syncSelection = useEffectEvent(() => {
    const isValid =
      !!selectedProjectId && projects.some((project) => project.id === selectedProjectId)
    if (!isValid) {
      setSelectedProjectId(projects[0]?.id ?? null)
    }
  })

  useEffect(() => {
    syncSelection()
  }, [projects])

  return (
    <div className="flex w-64 flex-col border-r border-neutral-300">
      <div className="p-2">
        <NewProjectButton />
      </div>

      <ul className="flex-1 overflow-y-auto">
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </ul>
    </div>
  )
}
