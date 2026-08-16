import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Download, Trash2 } from 'lucide-react'
import { recordingsAtom, selectedRecordingIdAtom } from './atoms'
import { deleteOpfsFile, readOpfsFile } from './opfs'
import type { Recording } from './types'

type RecordingItemProps = {
  recording: Recording
}

export function RecordingItem({ recording }: RecordingItemProps) {
  const [selectedRecordingId, setSelectedRecordingId] = useAtom(selectedRecordingIdAtom)
  const setRecordings = useSetAtom(recordingsAtom)
  const [editingName, setEditingName] = useState(recording.name)
  const isSelected = recording.id === selectedRecordingId

  function commitRename() {
    const name = editingName.trim()
    if (!name || name === recording.name) {
      setEditingName(recording.name)
      return
    }
    setRecordings((prev) =>
      prev.map((item) => (item.id === recording.id ? { ...item, name } : item)),
    )
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    await deleteOpfsFile(recording.opfsName)
    setRecordings((prev) => prev.filter((item) => item.id !== recording.id))
  }

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
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
      onClick={() => setSelectedRecordingId(recording.id)}
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
            setEditingName(recording.name)
            e.currentTarget.blur()
          }
        }}
        className={`min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none`}
      />

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
