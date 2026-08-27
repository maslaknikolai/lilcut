import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { FilePlay, Play } from 'lucide-react'
import { projectsAtom, videosAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { cn } from '@/App/lib/utils'
import { getProjectVideos } from '@/App/lib/library'
import { useRemoveProject } from '@/App/lib/useRemoveProject'
import { useVideoActions } from '@/App/lib/useVideoActions'
import { useVideoUrl } from '@/App/pages/VideoPage/useVideoUrl'
import { Modal } from '@/App/Modals/Modal'

type ProjectRemoveModalProps = {
  projectId: string
  onClose: () => void
}

export function ProjectRemoveModal({ projectId, onClose }: ProjectRemoveModalProps) {
  const projects = useAtomValue(projectsAtom)
  const videos = useAtomValue(videosAtom)
  const { deleteVideo } = useVideoActions()
  const [playingOpfsName, setPlayingOpfsName] = useState<string | null>(null)
  const removeProject = useRemoveProject()

  const project = projects.find((item) => item.id === projectId)
  const usedVideos = project ? getProjectVideos(project, videos) : []
  const playingVideoUrl = useVideoUrl(usedVideos.find((video) => video.opfsName === playingOpfsName))

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
          <li
            key={video.opfsName}
            className="flex flex-col rounded border border-slate-700"
          >
            <div className="flex items-center gap-2 px-2">
              <FilePlay
                size={14}
                className="shrink-0 text-violet-500"
              />
              <span className="min-w-0 flex-1 truncate py-2 text-sm text-slate-300">{video.opfsName}</span>
              <button
                type="button"
                onClick={() => setPlayingOpfsName((prev) => (prev === video.opfsName ? null : video.opfsName))}
                aria-label={`Play ${video.opfsName}`}
                className={cn(
                  'flex min-h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-stretch',
                  playingOpfsName === video.opfsName
                    ? 'text-violet-400'
                    : 'text-slate-500 hover:text-slate-100 active:text-white',
                )}
              >
                <Play size={14} />
              </button>
            </div>

            {playingOpfsName === video.opfsName && !!playingVideoUrl && (
              <video
                src={playingVideoUrl}
                controls
                autoPlay
                className="max-h-64 w-full bg-slate-950"
              />
            )}
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
