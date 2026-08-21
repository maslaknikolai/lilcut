import { cn } from '@/lib/utils'
import { Download, FilePlay } from 'lucide-react'
import { readOpfsFile } from './opfs'
import { RemoveButton } from './RemoveButton'
import { SidebarItemAction } from './SidebarItemAction'
import { SortingItem } from './SortingItem'
import type { MediaAsset } from './types'
import { useMediaAssetActions } from './useMediaAssetActions'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

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
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const { deleteMediaAsset } = useMediaAssetActions()
  const isSelected = mediaAsset.opfsName === selectedLibraryItemId

  async function handleRemove() {
    await deleteMediaAsset(mediaAsset.opfsName)
  }

  async function handleDownload() {
    const downloadedFile = await readOpfsFile(mediaAsset.opfsName)
    const url = URL.createObjectURL(downloadedFile)
    const link = document.createElement('a')
    link.href = url
    link.download = mediaAsset.opfsName
    link.click()
    URL.revokeObjectURL(url)
  }

  const selectionClassName = cn('cursor-pointer', isSelected ? 'bg-slate-800' : 'hover:bg-slate-900')

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

      <span className="min-w-0 flex-1 truncate py-2 text-xs text-slate-100">{mediaAsset.opfsName}</span>

      <SidebarItemAction
        onClick={handleDownload}
        label={`Download ${mediaAsset.opfsName}`}
        tooltip="Download file"
      >
        <Download size={16} />
      </SidebarItemAction>

      <RemoveButton
        label={mediaAsset.opfsName}
        onRemove={handleRemove}
      />
    </SortingItem>
  )
}
