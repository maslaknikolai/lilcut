import { useEffect, useEffectEvent, type ReactNode } from 'react'
import { useAtom } from 'jotai'
import { Play } from 'lucide-react'
import { playingPreviewAtom } from '@/App/atoms'
import type { Video } from '@/App/lib/types'
import { cn } from '@/App/lib/utils'
import { useVideoUrl } from '@/App/pages/VideoPage/useVideoUrl'

type VideoPreviewRowProps = {
  video: Video
  children: ReactNode
}

export function VideoPreviewRow({ video, children }: VideoPreviewRowProps) {
  const [playingPreview, setPlayingPreview] = useAtom(playingPreviewAtom)
  const isPlaying = playingPreview === video.opfsName
  const videoUrl = useVideoUrl(isPlaying ? video : undefined)

  const stopOnUnmount = useEffectEvent(() => {
    setPlayingPreview((prev) => (prev === video.opfsName ? null : prev))
  })

  useEffect(() => () => stopOnUnmount(), [])

  return (
    <div className="flex flex-col rounded border border-slate-700">
      <div className="flex items-center gap-2 px-2">
        {children}

        <button
          type="button"
          onClick={() => setPlayingPreview(isPlaying ? null : video.opfsName)}
          aria-label={`Play ${video.opfsName}`}
          className={cn(
            'flex min-h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-stretch',
            isPlaying ? 'text-violet-400' : 'text-slate-500 hover:text-slate-100 active:text-white',
          )}
        >
          <Play size={14} />
        </button>
      </div>

      {isPlaying && !!videoUrl && (
        <video
          src={videoUrl}
          controls
          autoPlay
          className="max-h-64 w-full bg-slate-950"
        />
      )}
    </div>
  )
}
