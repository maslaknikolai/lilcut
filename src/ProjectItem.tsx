import { useState } from 'react'
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
  const [editingName, setEditingName] = useState(project.name)
  const isSelected = project.id === selectedLibraryItemId

  function commitRename() {
    const name = editingName.trim()
    if (!name || name === project.name) {
      setEditingName(project.name)
      return
    }
    setProjects((prev) =>
      prev.map((item) => {
        if (item.id !== project.id) {
          return item
        }
        return { ...item, name }
      }),
    )
  }

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

  const selectionClassName = isSelected ? 'bg-neutral-200' : 'hover:bg-neutral-100'

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

      <input
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          }
          if (e.key === 'Escape') {
            setEditingName(project.name)
            e.currentTarget.blur()
          }
        }}
        className="min-w-0 flex-1 bg-transparent py-2 text-xs text-neutral-900 outline-none"
      />

      <button
        type="button"
        onClick={handleClone}
        className="cursor-pointer px-1.5 text-neutral-500 hover:text-neutral-900"
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
