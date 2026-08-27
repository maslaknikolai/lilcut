import { useAtomValue, useSetAtom } from 'jotai'
import { Download, Trash2 } from 'lucide-react'
import { activeModalAtom, ModalType, projectsAtom } from '@/App/atoms'
import { getProjectsUsingVideo } from '@/App/lib/library'
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
  const projects = useAtomValue(projectsAtom)
  const setActiveModal = useSetAtom(activeModalAtom)

  const projectsUsingVideo = getProjectsUsingVideo(projects, video.opfsName)

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

      {projectsUsingVideo.length ? (
        <SidebarItemAction
          onClick={() => setActiveModal({ type: ModalType.VideoRemove, opfsName: video.opfsName })}
          label={`Remove ${video.opfsName}`}
          tooltip="Remove"
          className="hover:text-red-400 active:text-red-300"
        >
          <Trash2 size={16} />
        </SidebarItemAction>
      ) : (
        <RemoveButton
          label={video.opfsName}
          onRemove={handleRemove}
        />
      )}
    </>
  )
}
