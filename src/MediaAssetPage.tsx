import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom } from './atoms'
import { CreateProjectFromMediaAssetButton } from './CreateProjectFromMediaAssetButton'
import { RenameField } from './RenameField'
import type { MediaAsset } from './types'
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
  const setProjects = useSetAtom(projectsAtom)
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

  return (
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden p-4">
      <div className="flex items-center gap-2">
        <RenameField
          key={mediaAsset.opfsName}
          initialValue={mediaAsset.opfsName}
          onCommit={commitRename}
          className={isNameTaken ? 'ring-1 ring-red-500' : ''}
        />

        <CreateProjectFromMediaAssetButton mediaAsset={mediaAsset} />
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
