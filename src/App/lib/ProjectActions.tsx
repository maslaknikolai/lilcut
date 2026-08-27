import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Files, Trash2 } from 'lucide-react'
import { activeModalAtom, ModalType, libraryOrderAtom, projectsAtom, videosAtom } from '@/App/atoms'
import { getProjectVideos } from '@/App/lib/library'
import { SidebarItemAction } from '@/App/lib/SidebarItemAction'
import { useRemoveProject } from '@/App/lib/useRemoveProject'
import { uniqueName } from '@/App/lib/uniqueName'
import type { Project } from '@/App/lib/types'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

type ProjectActionsProps = {
  project: Project
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const setActiveModal = useSetAtom(activeModalAtom)
  const videos = useAtomValue(videosAtom)
  const removeProject = useRemoveProject()

  function handleRemove() {
    if (!getProjectVideos(project, videos).length) {
      removeProject(project.id)
      return
    }
    setActiveModal({ type: ModalType.ProjectRemove, projectId: project.id })
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

      <SidebarItemAction
        onClick={handleRemove}
        label={`Remove ${project.name}`}
        tooltip="Remove"
        className="hover:text-red-400 active:text-red-300"
      >
        <Trash2 size={16} />
      </SidebarItemAction>
    </>
  )
}
