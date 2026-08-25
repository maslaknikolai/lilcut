import { Download } from 'lucide-react'
import { readOpfsFile } from '@/App/lib/opfs'
import { RemoveButton } from '@/App/lib/RemoveButton'
import { SidebarItemAction } from '@/App/lib/SidebarItemAction'
import type { Video } from '@/App/lib/types'
import { useVideoActions } from '@/App/lib/useVideoActions'
import { useRedirectAfterRemove } from '@/App/lib/useRedirectAfterRemove'

type VideoActionsProps = {
  video: Video
}

export function VideoActions({ video }: VideoActionsProps) {
  const { deleteVideo } = useVideoActions()
  const redirectAfterRemove = useRedirectAfterRemove()

  async function handleRemove() {
    await deleteVideo(video.opfsName)
    redirectAfterRemove(video.opfsName)
  }

  async function handleDownload() {
    const downloadedFile = await readOpfsFile(video.opfsName)
    const url = URL.createObjectURL(downloadedFile)
    const link = document.createElement('a')
    link.href = url
    link.download = video.opfsName
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <SidebarItemAction
        onClick={handleDownload}
        label={`Download ${video.opfsName}`}
        tooltip="Download file"
      >
        <Download size={16} />
      </SidebarItemAction>

      <RemoveButton
        label={video.opfsName}
        onRemove={handleRemove}
      />
    </>
  )
}
