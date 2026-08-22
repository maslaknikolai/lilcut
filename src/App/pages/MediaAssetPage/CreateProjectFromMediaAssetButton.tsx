import { useAtom, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { stripExtension } from '@/App/lib/stripExtension'
import type { MediaAsset } from '@/App/lib/types'
import { uniqueName } from '@/App/lib/uniqueName'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

type CreateProjectFromMediaAssetButtonProps = {
  mediaAsset: MediaAsset
}

export function CreateProjectFromMediaAssetButton({ mediaAsset }: CreateProjectFromMediaAssetButtonProps) {
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()

  function createProjectFromMediaAsset() {
    const projectId = crypto.randomUUID()
    const name = uniqueName(
      stripExtension(mediaAsset.opfsName),
      projects.map((project) => project.name),
    )
    const clip = { id: crypto.randomUUID(), mediaAssetOpfsName: mediaAsset.opfsName }
    setProjects((prev) => [{ id: projectId, name, clips: [clip] }, ...prev])
    setLibraryOrder((prev) => [projectId, ...prev])
    setSelectedLibraryItemId(projectId)
  }

  return (
    <GhostButton
      onClick={createProjectFromMediaAsset}
      className="px-3 text-blue-400"
    >
      <Scissors size={14} />
      <span>Use video in new project</span>
    </GhostButton>
  )
}
