import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Download } from 'lucide-react'
import { mediaFilesAtom, projectsAtom, selectedMediaFileIdAtom } from './atoms'
import { deleteOpfsFile, readOpfsFile, renameOpfsFile } from './opfs'
import { RemoveButton } from './RemoveButton'
import { SortingItem } from './SortingItem'
import type { MediaFile } from './types'

type MediaFileItemProps = {
  file: MediaFile
  isDragging: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
}

export function MediaFileItem({ file, isDragging, onDragStart, onDragOver, onDrop, onDragEnd }: MediaFileItemProps) {
  const [selectedMediaFileId, setSelectedMediaFileId] = useAtom(selectedMediaFileIdAtom)
  const [mediaFiles, setMediaFiles] = useAtom(mediaFilesAtom)
  const setProjects = useSetAtom(projectsAtom)
  const [editingOpfsName, setEditingOpfsName] = useState(file.opfsName)
  const [isNameTaken, setIsNameTaken] = useState(false)
  const isSelected = file.id === selectedMediaFileId

  async function commitRename() {
    const opfsName = editingOpfsName.trim()
    if (!opfsName || opfsName === file.opfsName) {
      setEditingOpfsName(file.opfsName)
      return
    }
    const isTaken = mediaFiles.some((item) => item.id !== file.id && item.opfsName === opfsName)
    if (isTaken) {
      setEditingOpfsName(file.opfsName)
      setIsNameTaken(true)
      setTimeout(() => setIsNameTaken(false), 1500)
      return
    }
    await renameOpfsFile(file.opfsName, opfsName)
    setMediaFiles((prev) => prev.map((item) => (item.id === file.id ? { ...item, opfsName } : item)))
    setProjects((prev) =>
      prev.map((project) => ({
        ...project,
        clips: project.clips.map((clip) =>
          clip.mediaFileOpfsName === file.opfsName ? { ...clip, mediaFileOpfsName: opfsName } : clip,
        ),
      })),
    )
  }

  async function handleRemove() {
    await deleteOpfsFile(file.opfsName)
    setMediaFiles((prev) => prev.filter((item) => item.id !== file.id))
  }

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    const downloadedFile = await readOpfsFile(file.opfsName)
    const url = URL.createObjectURL(downloadedFile)
    const link = document.createElement('a')
    link.href = url
    link.download = file.opfsName
    link.click()
    URL.revokeObjectURL(url)
  }

  const selectionClassName = isSelected ? 'bg-neutral-200' : 'hover:bg-neutral-100'

  return (
    <SortingItem
      isDragging={isDragging}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => setSelectedMediaFileId(file.id)}
      className={selectionClassName}
      dragHandleLabel={`Reorder ${file.opfsName}`}
    >
      <input
        value={editingOpfsName}
        onChange={(e) => setEditingOpfsName(e.target.value)}
        onBlur={commitRename}
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur()
          }
          if (e.key === 'Escape') {
            setEditingOpfsName(file.opfsName)
            e.currentTarget.blur()
          }
        }}
        className={`min-w-0 flex-1 bg-transparent py-2 text-xs text-neutral-900 outline-none ${isNameTaken ? 'ring-1 ring-red-500' : ''}`}
      />

      <button
        type="button"
        onClick={handleDownload}
        className="cursor-pointer px-1.5 text-neutral-500 hover:text-neutral-900"
        aria-label={`Download ${file.opfsName}`}
      >
        <Download size={16} />
      </button>

      <RemoveButton
        label={file.opfsName}
        onRemove={handleRemove}
      />
    </SortingItem>
  )
}
