import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FilePlay, Scissors } from 'lucide-react'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom } from './atoms'
import { CreateProjectFromMediaAssetButton } from './CreateProjectFromMediaAssetButton'
import { formatBytes } from './formatBytes'
import { MediaAssetActions } from './MediaAssetActions'
import { PageTitleField } from './PageTitleField'
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
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden bg-violet-950/50">
      <div className="flex gap-2 items-center p-4 pl-14 md:pl-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <PageTitleField
            key={mediaAsset.opfsName}
            label="Video"
            icon={
              <FilePlay
                size={16}
                className="shrink-0 text-violet-500"
              />
            }
            initialValue={mediaAsset.opfsName}
            onChange={commitRename}
            className={isNameTaken ? 'ring-1 ring-red-500' : ''}
          />
          <span className="px-0.5 pt-1 text-xs text-slate-500">{formatBytes(mediaAsset.size)}</span>
        </div>

        <div className="flex items-center gap-1 pt-8 self-start">
          <MediaAssetActions mediaAsset={mediaAsset} />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded bg-slate-950 px-4">
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
      <div className="flex flex-col gap-2 px-4 py-4 text-xs text-slate-500 max-h-32 overflow-y-auto">
        <CreateProjectFromMediaAssetButton mediaAsset={mediaAsset} />

        {projectsUsingAsset.length > 0 && (
          <div>
            Used in projects:
            <div className="flex flex-wrap gap-2 mt-1">
              {projectsUsingAsset.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedLibraryItemId(project.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded border border-slate-700 px-2 py-1 text-slate-100 hover:border-slate-500 active:border-slate-400 active:bg-slate-900"
                >
                  <Scissors
                    size={14}
                    className="shrink-0 text-blue-500"
                  />
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
