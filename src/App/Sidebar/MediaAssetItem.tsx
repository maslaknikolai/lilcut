import { FilePlay } from 'lucide-react'
import { LibraryItem } from '@/App/Sidebar/LibraryItem'
import { MediaAssetActions } from '@/App/lib/MediaAssetActions'
import type { MediaAsset } from '@/App/lib/types'

type MediaAssetItemProps = {
  mediaAsset: MediaAsset
}

export function MediaAssetItem({ mediaAsset }: MediaAssetItemProps) {
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
      actions={<MediaAssetActions mediaAsset={mediaAsset} />}
    />
  )
}
