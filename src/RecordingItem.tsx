import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Pencil, Download, Trash2 } from 'lucide-react'
import { recordingsAtom, selectedRecordingIdAtom } from './atoms'
import { deleteOpfsFile, readOpfsFile } from './opfs'
import type { Recording } from './types'

type RecordingItemProps = {
  recording: Recording
}

export function RecordingItem({ recording }: RecordingItemProps) {
  const [selectedId, setSelectedId] = useAtom(selectedRecordingIdAtom)
  const setRecordings = useSetAtom(recordingsAtom)
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState(recording.name)
  const isSelected = recording.id === selectedId

  function startRename() {
    setEditingName(recording.name)
    setIsEditing(true)
  }

  function commitRename() {
    const name = editingName.trim()
    if (name) {
      setRecordings((prev) =>
        prev.map((item) => (item.id === recording.id ? { ...item, name } : item)),
      )
    }
    setIsEditing(false)
  }

  async function handleDelete() {
    await deleteOpfsFile(recording.opfsName)
    setRecordings((prev) => prev.filter((item) => item.id !== recording.id))
  }

  async function handleDownload() {
    const file = await readOpfsFile(recording.opfsName)
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    const extension = recording.opfsName.split('.').pop()
    link.download = `${recording.name}.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <li
      className={`flex items-center border-b border-neutral-300 ${
        isSelected ? 'bg-neutral-200' : ''
      }`}
    >
      {isEditing ? (
        <input
          autoFocus
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          className="min-w-0 flex-1 border-b border-neutral-400 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setSelectedId(recording.id)}
          className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-neutral-900 ${
            isSelected ? 'font-medium' : 'hover:bg-neutral-200'
          }`}
        >
          {recording.name}
        </button>
      )}
      <button
        type="button"
        onClick={startRename}
        className="px-1.5 text-neutral-500 hover:text-neutral-900"
        aria-label={`Rename ${recording.name}`}
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={handleDownload}
        className="px-1.5 text-neutral-500 hover:text-neutral-900"
        aria-label={`Download ${recording.name}`}
      >
        <Download size={16} />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="px-1.5 pr-2 text-neutral-500 hover:text-red-700"
        aria-label={`Delete ${recording.name}`}
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}
