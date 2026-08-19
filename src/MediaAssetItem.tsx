import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Download, FilePlay } from 'lucide-react'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom, selectedLibraryItemIdAtom } from './atoms'
import { readOpfsFile } from './opfs'
import { RemoveButton } from './RemoveButton'
import { SortingItem } from './SortingItem'
import type { MediaAsset } from './types'
import { useMediaAssetActions } from './useMediaAssetActions'

type MediaAssetItemProps = {
  mediaAsset: MediaAsset
  isDragging: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
}

export function MediaAssetItem({
  mediaAsset,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: MediaAssetItemProps) {
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useAtom(selectedLibraryItemIdAtom)
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { renameMediaAsset, deleteMediaAsset } = useMediaAssetActions()
  const setProjects = useSetAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [editingOpfsName, setEditingOpfsName] = useState(mediaAsset.opfsName)
  const [isNameTaken, setIsNameTaken] = useState(false)
  const isSelected = mediaAsset.opfsName === selectedLibraryItemId

  async function commitRename() {
    const opfsName = editingOpfsName.trim()
    if (!opfsName || opfsName === mediaAsset.opfsName) {
      setEditingOpfsName(mediaAsset.opfsName)
      return
    }
    const isTaken = mediaAssets.some((item) => item.opfsName !== mediaAsset.opfsName && item.opfsName === opfsName)
    if (isTaken) {
      setEditingOpfsName(mediaAsset.opfsName)
      setIsNameTaken(true)
      setTimeout(() => setIsNameTaken(false), 1500)
      return
    }
    await renameMediaAsset(mediaAsset.opfsName, opfsName)
    setProjects((prev) =>
      prev.map((project) => {
        const clips = project.clips.map((clip) => {
          if (clip.mediaAssetOpfsName !== mediaAsset.opfsName) {
            return clip
          }
          return { ...clip, mediaAssetOpfsName: opfsName }
        })
        return { ...project, clips }
      }),
    )
    setLibraryOrder((prev) => prev.map((id) => (id === mediaAsset.opfsName ? opfsName : id)))
    if (selectedLibraryItemId === mediaAsset.opfsName) {
      setSelectedLibraryItemId(opfsName)
    }
  }

  async function handleRemove() {
    await deleteMediaAsset(mediaAsset.opfsName)
  }

  async function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    const downloadedFile = await readOpfsFile(mediaAsset.opfsName)
    const url = URL.createObjectURL(downloadedFile)
    const link = document.createElement('a')
    link.href = url
    link.download = mediaAsset.opfsName
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
      onClick={() => setSelectedLibraryItemId(mediaAsset.opfsName)}
      className={selectionClassName}
      dragHandleLabel={`Reorder ${mediaAsset.opfsName}`}
    >
      <FilePlay
        size={14}
        className="mr-1.5 shrink-0 text-violet-500"
      />

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
            setEditingOpfsName(mediaAsset.opfsName)
            e.currentTarget.blur()
          }
        }}
        className={`min-w-0 flex-1 bg-transparent py-2 text-xs text-neutral-900 outline-none ${isNameTaken ? 'ring-1 ring-red-500' : ''}`}
      />

      <button
        type="button"
        onClick={handleDownload}
        className="cursor-pointer px-1.5 text-neutral-500 hover:text-neutral-900"
        aria-label={`Download ${mediaAsset.opfsName}`}
      >
        <Download size={16} />
      </button>

      <RemoveButton
        label={mediaAsset.opfsName}
        onRemove={handleRemove}
      />
    </SortingItem>
  )
}
