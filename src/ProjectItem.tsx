import { cn } from '@/lib/utils'
import { useAtom, useSetAtom } from 'jotai'
import { Files, Scissors } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from './atoms'
import { RemoveButton } from './RemoveButton'
import { SortingItem } from './SortingItem'
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
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const isSelected = project.id === selectedLibraryItemId

  function handleRemove() {
    setProjects((prev) => prev.filter((item) => item.id !== project.id))
    setLibraryOrder((prev) => prev.filter((id) => id !== project.id))
  }

  function handleClone(e: React.MouseEvent) {
    e.stopPropagation()
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

  const selectionClassName = cn('cursor-pointer', isSelected ? 'bg-slate-800' : 'hover:bg-slate-900')

  return (
    <SortingItem
      isDragging={isDragging}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => setSelectedLibraryItemId(project.id)}
      className={selectionClassName}
      dragHandleLabel={`Reorder ${project.name}`}
    >
      <Scissors
        size={14}
        className="mr-1.5 shrink-0 text-blue-500"
      />

      <span className="min-w-0 flex-1 truncate py-2 text-xs text-slate-100">{project.name}</span>

      <button
        type="button"
        onClick={handleClone}
        className="cursor-pointer px-1.5 text-slate-500 hover:text-slate-100"
        aria-label={`Clone ${project.name}`}
      >
        <Files size={16} />
      </button>

      <RemoveButton
        label={project.name}
        onRemove={handleRemove}
      />
    </SortingItem>
  )
}
