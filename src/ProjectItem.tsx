import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Copy } from 'lucide-react'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import { RemoveButton } from './RemoveButton'
import { SortingItem } from './SortingItem'
import type { Project } from './types'

type ProjectItemProps = {
  project: Project
  isDragging: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
}

export function ProjectItem({ project, isDragging, onDragStart, onDragOver, onDrop, onDragEnd }: ProjectItemProps) {
  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom)
  const setProjects = useSetAtom(projectsAtom)
  const [editingName, setEditingName] = useState(project.name)
  const isSelected = project.id === selectedProjectId

  function commitRename() {
    const name = editingName.trim()
    if (!name || name === project.name) {
      setEditingName(project.name)
      return
    }
    setProjects((prev) => prev.map((item) => (item.id === project.id ? { ...item, name } : item)))
  }

  function handleRemove() {
    setProjects((prev) => prev.filter((item) => item.id !== project.id))
  }

  function handleClone(e: React.MouseEvent) {
    e.stopPropagation()
    const cloneId = crypto.randomUUID()
    const clonedClips = project.clips.map((clip) => ({ ...clip, id: crypto.randomUUID() }))
    setProjects((prev) => [{ id: cloneId, name: `${project.name} copy`, clips: clonedClips }, ...prev])
    setSelectedProjectId(cloneId)
  }

  const selectionClassName = isSelected ? 'bg-neutral-200' : 'hover:bg-neutral-100'

  return (
    <SortingItem
      isDragging={isDragging}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => setSelectedProjectId(project.id)}
      className={selectionClassName}
      dragHandleLabel={`Reorder ${project.name}`}
    >
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
        className="px-1.5 text-neutral-500 hover:text-neutral-900"
        aria-label={`Clone ${project.name}`}
      >
        <Copy size={16} />
      </button>

      <RemoveButton label={project.name} onRemove={handleRemove} />
    </SortingItem>
  )
}
