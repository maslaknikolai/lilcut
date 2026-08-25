import { useAtom, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { stripExtension } from '@/App/lib/stripExtension'
import type { Video } from '@/App/lib/types'
import { uniqueName } from '@/App/lib/uniqueName'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

type CreateProjectFromVideoButtonProps = {
  video: Video
}

export function CreateProjectFromVideoButton({ video }: CreateProjectFromVideoButtonProps) {
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  function createProjectFromVideo() {
    const projectId = crypto.randomUUID()
    const name = uniqueName(
      stripExtension(video.opfsName),
      projects.map((project) => project.name),
    )
    const clip = { id: crypto.randomUUID(), videoOpfsName: video.opfsName }
    setProjects((prev) => [{ id: projectId, name, clips: [clip] }, ...prev])
    setLibraryOrder((prev) => [projectId, ...prev])
    setSelectedLibraryItemId(projectId)
  }

  return (
    <GhostButton
      onClick={createProjectFromVideo}
      className="px-3 text-blue-400"
    >
      <Scissors size={14} />
      <span>Use video in new project</span>
    </GhostButton>
  )
}
