import { useAtom, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { libraryOrderAtom, projectsAtom } from './atoms'
import { GhostButton } from './GhostButton'
import { stripExtension } from './stripExtension'
import type { MediaAsset } from './types'
import { uniqueName } from './uniqueName'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

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
      className="px-3 py-1.5 text-blue-400"
    >
      <Scissors size={14} />
      <span>Use video in new project</span>
    </GhostButton>
  )
}
