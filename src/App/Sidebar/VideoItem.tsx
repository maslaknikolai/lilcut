import { FilePlay } from 'lucide-react'
import { LibraryItem } from '@/App/Sidebar/LibraryItem'
import { VideoActions } from '@/App/lib/VideoActions'
import type { Video } from '@/App/lib/types'

type VideoItemProps = {
  video: Video
}

export function VideoItem({ video }: VideoItemProps) {
  return (
    <LibraryItem
      id={video.opfsName}
      name={video.opfsName}
      icon={
        <FilePlay
          size={14}
          className="shrink-0 text-violet-500"
        />
      }
      actions={<VideoActions video={video} />}
    />
  )
}
