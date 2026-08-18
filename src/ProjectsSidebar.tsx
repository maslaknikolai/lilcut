import { useEffect, useEffectEvent } from 'react'
import { useAtom } from 'jotai'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { NewProjectButton } from './NewProjectButton'
import { ProjectItem } from './ProjectItem'
import { RecordControls } from './RecordControls'
import { Sidebar } from './Sidebar'
import { SidebarActions } from './SidebarActions'
import { SortingList } from './SortingList'

export function ProjectsSidebar() {
  const [projects, setProjects] = useAtom(projectsAtom)
  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom)

  // keep a valid selection: autoselect the first project, and reselect
  // after the selected one is deleted
  const syncSelection = useEffectEvent(() => {
    const isValid = !!selectedProjectId && projects.some((project) => project.id === selectedProjectId)
    if (!isValid) {
      setSelectedProjectId(projects[0]?.id ?? null)
    }
  })

  useEffect(() => {
    syncSelection()
  }, [projects])

  return (
    <Sidebar>
      <SidebarActions>
        <RecordControls />
        <NewProjectButton />
      </SidebarActions>

      <SortingList
        items={projects}
        onReorder={setProjects}
        renderItem={(project, dragProps) => (
          <ProjectItem
            project={project}
            {...dragProps}
          />
        )}
      />
    </Sidebar>
  )
}
