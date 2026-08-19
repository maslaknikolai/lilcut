import { useMediaAssetVideoUrl } from './useMediaAssetVideoUrl'
import type { MediaAsset } from './types'

type MediaAssetPageProps = {
  mediaAsset: MediaAsset
}

export function MediaAssetPage({ mediaAsset }: MediaAssetPageProps) {
  const videoUrl = useMediaAssetVideoUrl(mediaAsset)

  if (!videoUrl) {
    return <div className="flex flex-1 items-center justify-center text-center text-neutral-600">Loading…</div>
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <video
        src={videoUrl}
        controls
        className="max-h-full max-w-full"
      />
    </div>
  )
}
