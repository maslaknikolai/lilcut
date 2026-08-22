import { FilePlay, SlidersHorizontal } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { formatTimestamp } from './formatTimestamp'
import type { MediaAsset } from './types'

type VideosListItemProps = {
  mediaAsset: MediaAsset
  isChecked: boolean
  onToggleChecked: () => void
  onTrim: () => void
}

export function VideosListItem({ mediaAsset, isChecked, onToggleChecked, onTrim }: VideosListItemProps) {
  return (
    <div className="flex items-center gap-2 rounded border border-slate-700 px-2">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <Checkbox
          checked={isChecked}
          onCheckedChange={onToggleChecked}
        />
        <FilePlay
          size={14}
          className="shrink-0 text-violet-500"
        />
        <span className="min-w-0 flex-1 truncate py-2 text-sm text-slate-300">{mediaAsset.opfsName}</span>
      </label>
      <span className="shrink-0 text-xs text-slate-500">{formatTimestamp(mediaAsset.duration)}</span>
      <button
        type="button"
        onClick={onTrim}
        className="flex w-10 shrink-0 cursor-pointer items-center justify-center self-stretch text-slate-500 hover:text-slate-100 active:text-white"
        aria-label={`Set range for ${mediaAsset.opfsName}`}
      >
        <SlidersHorizontal size={14} />
      </button>
    </div>
  )
}
