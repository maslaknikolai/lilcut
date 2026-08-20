import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom } from './atoms'
import { ActionButton } from './ActionButton'
import { RenameField } from './RenameField'
import { stripExtension } from './stripExtension'
import type { MediaAsset } from './types'
import { uniqueName } from './uniqueName'
import { useMediaAssetActions } from './useMediaAssetActions'
import { useMediaAssetVideoUrl } from './useMediaAssetVideoUrl'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

type MediaAssetPageProps = {
  mediaAsset: MediaAsset
}

export function MediaAssetPage({ mediaAsset }: MediaAssetPageProps) {
  const videoUrl = useMediaAssetVideoUrl(mediaAsset)
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { renameMediaAsset } = useMediaAssetActions()
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const [isNameTaken, setIsNameTaken] = useState(false)

  async function commitRename(opfsName: string) {
    const isTaken = mediaAssets.some((item) => item.opfsName !== mediaAsset.opfsName && item.opfsName === opfsName)
    if (isTaken) {
      setIsNameTaken(true)
      setTimeout(() => setIsNameTaken(false), 1500)
      return
    }
    await renameMediaAsset(mediaAsset.opfsName, opfsName)
    setProjects((prev) =>
      prev.map((project) => {
        const clips = project.clips.map((clip) => {
          if (clip.mediaAssetOpfsName !== mediaAsset.opfsName) {
            return clip
          }
          return { ...clip, mediaAssetOpfsName: opfsName }
        })
        return { ...project, clips }
      }),
    )
    setLibraryOrder((prev) => prev.map((id) => (id === mediaAsset.opfsName ? opfsName : id)))
    if (selectedLibraryItemId === mediaAsset.opfsName) {
      setSelectedLibraryItemId(opfsName)
    }
  }

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
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden p-4">
      <RenameField
        key={mediaAsset.opfsName}
        initialValue={mediaAsset.opfsName}
        onCommit={commitRename}
        className={isNameTaken ? 'ring-1 ring-red-500' : ''}
      />

      <div className="flex">
        <ActionButton
          onClick={createProjectFromMediaAsset}
          className="border-slate-700 text-blue-400 hover:bg-slate-900"
        >
          <Scissors size={14} />
          <span>Use video in new project</span>
        </ActionButton>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="max-h-full max-w-full"
          />
        ) : (
          <span className="text-slate-400">Loading…</span>
        )}
      </div>
    </div>
  )
}
