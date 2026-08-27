import { FilePlay, SlidersHorizontal } from 'lucide-react'
import { Checkbox } from '@/App/lib/ui/checkbox'
import { cn } from '@/App/lib/utils'
import { formatTimestamp } from '@/App/lib/formatTimestamp'
import type { Video } from '@/App/lib/types'
import { VideoPreviewRow } from '@/App/lib/VideoPreviewRow'

type VideosListItemProps = {
  video: Video
  isChecked: boolean
  // the pending clip's settings differ from the default full-length clip
  isModified: boolean
  onToggleChecked: () => void
  onTrim: () => void
}

export function VideosListItem({ video, isChecked, isModified, onToggleChecked, onTrim }: VideosListItemProps) {
  return (
    <VideoPreviewRow video={video}>
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <Checkbox
          checked={isChecked}
          onCheckedChange={onToggleChecked}
        />
        <FilePlay
          size={14}
          className="shrink-0 text-violet-500"
        />
        <span className="min-w-0 flex-1 truncate py-2 text-sm text-slate-300">{video.opfsName}</span>
      </label>
      <span className="shrink-0 text-xs text-slate-500">{formatTimestamp(video.duration)}</span>
      <button
        type="button"
        onClick={onTrim}
        className={cn(
          'flex min-h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-stretch',
          isModified
            ? 'text-orange-400 hover:text-orange-300 active:text-orange-200'
            : 'text-slate-500 hover:text-slate-100 active:text-white',
        )}
        aria-label={`Set range for ${video.opfsName}`}
      >
        <SlidersHorizontal size={14} />
      </button>
    </VideoPreviewRow>
  )
}
