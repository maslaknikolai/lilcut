import { FilePlay } from 'lucide-react'
import { LibraryItem } from './LibraryItem'
import { MediaAssetActions } from './MediaAssetActions'
import type { MediaAsset } from './types'

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
