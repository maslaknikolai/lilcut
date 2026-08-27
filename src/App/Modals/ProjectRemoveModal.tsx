import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { FilePlay } from 'lucide-react'
import { projectsAtom, videosAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { Checkbox } from '@/App/lib/ui/checkbox'
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
  const [checkedOpfsNames, setCheckedOpfsNames] = useState<string[]>([])

  const project = projects.find((item) => item.id === projectId)
  const usedVideos = project ? getProjectVideos(project, videos) : []

  function toggleChecked(opfsName: string) {
    setCheckedOpfsNames((prev) => {
      if (prev.includes(opfsName)) {
        return prev.filter((name) => name !== opfsName)
      }
      return [...prev, opfsName]
    })
  }

  async function handleRemove() {
    for (const opfsName of checkedOpfsNames) {
      await deleteVideo(opfsName)
    }
    removeProject(projectId)
    onClose()
  }

  if (!project) {
    return null
  }

  const checkedCount = checkedOpfsNames.length
  const removeLabel = checkedCount ? `Remove project and ${checkedCount} video(s)` : 'Remove project only'

  return (
    <Modal
      title={`Remove ${project.name}`}
      onClose={onClose}
    >
      <span className="text-sm text-slate-400">Check the videos to remove along with the project:</span>

      <ul className="flex flex-col gap-1">
        {usedVideos.map((video) => (
          <li key={video.opfsName}>
            <VideoPreviewRow video={video}>
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                <Checkbox
                  checked={checkedOpfsNames.includes(video.opfsName)}
                  onCheckedChange={() => toggleChecked(video.opfsName)}
                />
                <FilePlay
                  size={14}
                  className="shrink-0 text-violet-500"
                />
                <span className="min-w-0 flex-1 truncate py-2 text-sm text-slate-300">{video.opfsName}</span>
              </label>
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
          onClick={handleRemove}
          className="px-3 text-red-400 hover:text-red-300"
        >
          {removeLabel}
        </GhostButton>
      </div>
    </Modal>
  )
}
