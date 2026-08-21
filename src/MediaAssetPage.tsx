import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom } from './atoms'
import { CreateProjectFromMediaAssetButton } from './CreateProjectFromMediaAssetButton'
import { formatBytes } from './formatBytes'
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

  const projectsUsingAsset = projects.filter((project) =>
    project.clips.some((clip) => clip.mediaAssetOpfsName === mediaAsset.opfsName),
  )

  return (
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden p-4">
      <div className="flex items-center gap-2">
        <RenameField
          key={mediaAsset.opfsName}
          initialValue={mediaAsset.opfsName}
          onCommit={commitRename}
          className={isNameTaken ? 'ring-1 ring-red-500' : ''}
        />

        <span className="shrink-0 text-xs text-slate-500">{formatBytes(mediaAsset.size)}</span>

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
      {projectsUsingAsset.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          Used in:
          {projectsUsingAsset.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedLibraryItemId(project.id)}
              className="cursor-pointer text-blue-400 hover:underline"
            >
              {project.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
