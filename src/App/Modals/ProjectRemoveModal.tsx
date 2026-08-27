import { useAtomValue } from 'jotai'
import { FilePlay } from 'lucide-react'
import { projectsAtom, videosAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { getProjectVideos } from '@/App/lib/library'
import { useRemoveProject } from '@/App/lib/useRemoveProject'
import { useVideoActions } from '@/App/lib/useVideoActions'
import { VideoPreviewRow } from '@/App/lib/VideoPreviewRow'
import { Modal } from '@/App/Modals/Modal'

type ProjectRemoveModalProps = {
  projectId: string
  onClose: () => void
}

export function ProjectRemoveModal({ projectId, onClose }: ProjectRemoveModalProps) {
  const projects = useAtomValue(projectsAtom)
  const videos = useAtomValue(videosAtom)
  const { deleteVideo } = useVideoActions()
  const removeProject = useRemoveProject()

  const project = projects.find((item) => item.id === projectId)
  const usedVideos = project ? getProjectVideos(project, videos) : []

  function removeProjectOnly() {
    removeProject(projectId)
    onClose()
  }

  async function removeProjectWithVideos() {
    for (const video of usedVideos) {
      await deleteVideo(video.opfsName)
    }
    removeProjectOnly()
  }

  if (!project) {
    return null
  }

  return (
    <Modal
      title={`Remove ${project.name}`}
      onClose={onClose}
    >
      <span className="text-sm text-slate-400">This project uses these videos:</span>

      <ul className="flex flex-col gap-1">
        {usedVideos.map((video) => (
          <li key={video.opfsName}>
            <VideoPreviewRow video={video}>
              <FilePlay
                size={14}
                className="shrink-0 text-violet-500"
              />
              <span className="min-w-0 flex-1 truncate py-2 text-sm text-slate-300">{video.opfsName}</span>
            </VideoPreviewRow>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <GhostButton
          onClick={onClose}
          className="px-3"
        >
          Cancel
        </GhostButton>

        <GhostButton
          onClick={removeProjectOnly}
          className="px-3 text-red-400 hover:text-red-300"
        >
          Remove project only
        </GhostButton>

        <GhostButton
          onClick={removeProjectWithVideos}
          className="px-3 text-red-400 hover:text-red-300"
        >
          Remove project and videos
        </GhostButton>
      </div>
    </Modal>
  )
}
