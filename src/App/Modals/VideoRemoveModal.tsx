import { useAtomValue } from 'jotai'
import { Scissors } from 'lucide-react'
import { projectsAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { getProjectsUsingVideo } from '@/App/lib/library'
import { useRedirectAfterRemove } from '@/App/lib/useRedirectAfterRemove'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'
import { useVideoActions } from '@/App/lib/useVideoActions'
import { Modal } from '@/App/Modals/Modal'

type VideoRemoveModalProps = {
  opfsName: string
  onClose: () => void
}

export function VideoRemoveModal({ opfsName, onClose }: VideoRemoveModalProps) {
  const projects = useAtomValue(projectsAtom)
  const { deleteVideo } = useVideoActions()
  const redirectAfterRemove = useRedirectAfterRemove()
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  const projectsUsingVideo = getProjectsUsingVideo(projects, opfsName)

  async function removeVideo() {
    await deleteVideo(opfsName)
    redirectAfterRemove(opfsName)
    onClose()
  }

  function openProject(projectId: string) {
    setSelectedLibraryItemId(projectId)
    onClose()
  }

  return (
    <Modal
      title={`Remove ${opfsName}`}
      onClose={onClose}
    >
      <span className="text-sm text-slate-400">Are you sure? This video is used in the following projects:</span>

      <ul className="flex flex-col gap-1">
        {projectsUsingVideo.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              onClick={() => openProject(project.id)}
              className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded border border-slate-700 px-2 text-sm text-slate-100 hover:border-slate-500 active:border-slate-400 active:bg-slate-900"
            >
              <Scissors
                size={14}
                className="shrink-0 text-blue-500"
              />
              <span className="min-w-0 flex-1 truncate text-left">{project.name}</span>
            </button>
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
          onClick={removeVideo}
          className="px-3 text-red-400 hover:text-red-300"
        >
          Remove video
        </GhostButton>
      </div>
    </Modal>
  )
}
