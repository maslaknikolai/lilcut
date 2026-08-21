import { useAtom, useSetAtom } from 'jotai'
import { Files } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from './atoms'
import { RemoveButton } from './RemoveButton'
import { SidebarItemAction } from './SidebarItemAction'
import { uniqueName } from './uniqueName'
import type { Project } from './types'
import { useRedirectAfterRemove } from './useRedirectAfterRemove'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

type ProjectActionsProps = {
  project: Project
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const redirectAfterRemove = useRedirectAfterRemove()

  function handleRemove() {
    setProjects((prev) => prev.filter((item) => item.id !== project.id))
    setLibraryOrder((prev) => prev.filter((id) => id !== project.id))
    redirectAfterRemove(project.id)
  }

  function handleClone() {
    const cloneId = crypto.randomUUID()
    const clonedClips = project.clips.map((clip) => ({ ...clip, id: crypto.randomUUID() }))
    const cloneName = uniqueName(
      project.name,
      projects.map((item) => item.name),
    )
    setProjects((prev) => [{ id: cloneId, name: cloneName, clips: clonedClips }, ...prev])
    setLibraryOrder((prev) => [cloneId, ...prev])
    setSelectedLibraryItemId(cloneId)
  }

  return (
    <>
      <SidebarItemAction
        onClick={handleClone}
        label={`Clone ${project.name}`}
        tooltip="Clone project"
      >
        <Files size={16} />
      </SidebarItemAction>

      <RemoveButton
        label={project.name}
        onRemove={handleRemove}
      />
    </>
  )
}
