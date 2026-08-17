import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Trash2 } from 'lucide-react'
import { projectsAtom, selectedProjectIdAtom } from './atoms'
import type { Project } from './types'

type ProjectItemProps = {
  project: Project
}

export function ProjectItem({ project }: ProjectItemProps) {
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

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setProjects((prev) => prev.filter((item) => item.id !== project.id))
  }

  return (
    <li
      onClick={() => setSelectedProjectId(project.id)}
      className={`flex items-center border-b border-neutral-300 ${
        isSelected ? 'bg-neutral-200' : 'hover:bg-neutral-100'
      }`}
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
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none"
      />

      <button
        type="button"
        onClick={handleDelete}
        className="px-1.5 pr-2 text-neutral-500 hover:text-red-700"
        aria-label={`Delete ${project.name}`}
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}
