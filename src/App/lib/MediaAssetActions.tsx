import { Download } from 'lucide-react'
import { readOpfsFile } from '@/App/lib/opfs'
import { RemoveButton } from '@/App/lib/RemoveButton'
import { SidebarItemAction } from '@/App/lib/SidebarItemAction'
import type { MediaAsset } from '@/App/lib/types'
import { useMediaAssetActions } from '@/App/lib/useMediaAssetActions'
import { useRedirectAfterRemove } from '@/App/lib/useRedirectAfterRemove'

type MediaAssetActionsProps = {
  mediaAsset: MediaAsset
}

export function MediaAssetActions({ mediaAsset }: MediaAssetActionsProps) {
  const { deleteMediaAsset } = useMediaAssetActions()
  const redirectAfterRemove = useRedirectAfterRemove()

  async function handleRemove() {
    await deleteMediaAsset(mediaAsset.opfsName)
    redirectAfterRemove(mediaAsset.opfsName)
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
    <>
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
    </>
  )
}
