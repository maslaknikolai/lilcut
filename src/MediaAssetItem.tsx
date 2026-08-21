import { Download, FilePlay } from 'lucide-react'
import { LibraryItem } from './LibraryItem'
import { readOpfsFile } from './opfs'
import { RemoveButton } from './RemoveButton'
import { SidebarItemAction } from './SidebarItemAction'
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
  const { deleteMediaAsset } = useMediaAssetActions()

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

  return (
    <LibraryItem
      id={mediaAsset.opfsName}
      name={mediaAsset.opfsName}
      icon={
        <FilePlay
          size={14}
          className="shrink-0 text-violet-500"
        />
      }
      isDragging={isDragging}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
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
    </LibraryItem>
  )
}
