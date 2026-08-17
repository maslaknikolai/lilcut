import { useAtomValue } from 'jotai'
import { mediaFilesAtom } from './atoms'
import type { Clip } from './types'

type ClipItemProps = {
  clip: Clip
  isSelected: boolean
  onSelect: () => void
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const wholeSeconds = Math.floor(seconds % 60)
  return `${minutes}:${String(wholeSeconds).padStart(2, '0')}`
}

export function ClipItem({ clip, isSelected, onSelect }: ClipItemProps) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const mediaFile = mediaFiles.find((file) => file.id === clip.mediaFileId)
  const start = formatTimestamp(clip.cutStart ?? 0)
  const end = clip.cutEnd !== undefined ? formatTimestamp(clip.cutEnd) : null

  return (
    <li
      onClick={onSelect}
      className={`flex items-center gap-2 border-b border-neutral-300 px-3 py-2 text-sm ${
        isSelected ? 'bg-neutral-200' : 'hover:bg-neutral-100'
      }`}
    >
      <span className="min-w-0 flex-1 truncate text-neutral-900">
        {mediaFile?.name ?? 'Unknown file'}
      </span>
      <span className="shrink-0 text-neutral-500">
        {start}
        {end ? `–${end}` : ''}
      </span>
    </li>
  )
}
