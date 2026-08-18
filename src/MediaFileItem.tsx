import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Download } from 'lucide-react'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { deleteOpfsFile, readOpfsFile } from './opfs'
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
  const setMediaFiles = useSetAtom(mediaFilesAtom)
  const [editingName, setEditingName] = useState(file.name)
  const isSelected = file.id === selectedMediaFileId

  function commitRename() {
    const name = editingName.trim()
    if (!name || name === file.name) {
      setEditingName(file.name)
      return
    }
    setMediaFiles((prev) => prev.map((item) => (item.id === file.id ? { ...item, name } : item)))
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
    const extension = file.opfsName.split('.').pop()
    link.download = `${file.name}.${extension}`
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
      dragHandleLabel={`Reorder ${file.name}`}
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
            setEditingName(file.name)
            e.currentTarget.blur()
          }
        }}
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-neutral-900 outline-none"
      />

      <button
        type="button"
        onClick={handleDownload}
        className="px-1.5 text-neutral-500 hover:text-neutral-900"
        aria-label={`Download ${file.name}`}
      >
        <Download size={16} />
      </button>

      <RemoveButton label={file.name} onRemove={handleRemove} />
    </SortingItem>
  )
}
