import { useAtom, useSetAtom } from 'jotai'
import { Files, Scissors } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from './atoms'
import { LibraryItem } from './LibraryItem'
import { RemoveButton } from './RemoveButton'
import { SidebarItemAction } from './SidebarItemAction'
import { uniqueName } from './uniqueName'
import type { Project } from './types'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

type ProjectItemProps = {
  project: Project
  isDragging: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
}

export function ProjectItem({ project, isDragging, onDragStart, onDragOver, onDrop, onDragEnd }: ProjectItemProps) {
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

  function handleRemove() {
    setProjects((prev) => prev.filter((item) => item.id !== project.id))
    setLibraryOrder((prev) => prev.filter((id) => id !== project.id))
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
    <LibraryItem
      id={project.id}
      name={project.name}
      icon={
        <Scissors
          size={14}
          className="shrink-0 text-blue-500"
        />
      }
      isDragging={isDragging}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
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
    </LibraryItem>
  )
}
