import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { X } from 'lucide-react'
import { projectsAtom } from './atoms'
import { ClipRangeEditor } from './ClipRangeEditor'
import { updateProject } from './library'
import { isClipRangeValid } from './projectTimeline'
import type { Clip } from './types'
import { UploadMediaAssetButton } from './UploadMediaAssetButton'
import { useOrderedMediaAssets } from './useOrderedMediaAssets'
import { VideosListItem } from './VideosListItem'

type ClipCreateModalProps = {
  projectId: string
  insertAt?: number
  onClose: () => void
}

export function ClipCreateModal({ projectId, insertAt, onClose }: ClipCreateModalProps) {
  const setProjects = useSetAtom(projectsAtom)
  const mediaAssets = useOrderedMediaAssets()
  const [clipsToBeAdded, setClipsToBeAdded] = useState<Clip[]>([])
  const [trimmingClip, setTrimmingClip] = useState<Clip | null>(null)

  const checkedOpfsNames = clipsToBeAdded.map((clip) => clip.mediaAssetOpfsName)

  function makeFullClip(opfsName: string): Clip {
    return { id: crypto.randomUUID(), mediaAssetOpfsName: opfsName, cutStart: 0 }
  }

  function toggleChecked(opfsName: string) {
    setClipsToBeAdded((prev) => {
      const isChecked = prev.some((clip) => clip.mediaAssetOpfsName === opfsName)
      if (isChecked) {
        return prev.filter((clip) => clip.mediaAssetOpfsName !== opfsName)
      }
      return [...prev, makeFullClip(opfsName)]
    })
  }

  function handleAddClips() {
    if (!clipsToBeAdded.length) {
      return
    }
    setProjects((prev) =>
      updateProject(prev, projectId, (project) => {
        const targetIndex = insertAt ?? project.clips.length
        return {
          ...project,
          clips: [...project.clips.slice(0, targetIndex), ...clipsToBeAdded, ...project.clips.slice(targetIndex)],
        }
      }),
    )
    onClose()
  }

  function addTrimmedClip(trimmedClip: Clip) {
    setClipsToBeAdded((prev) => [...prev, trimmedClip])
    setTrimmingClip(null)
  }

  if (trimmingClip) {
    return (
      <ClipRangeEditor
        clip={trimmingClip}
        title="New clip"
        onClipChange={setTrimmingClip}
        onBack={() => setTrimmingClip(null)}
        onClose={onClose}
        actions={
          <>
            <button
              type="button"
              onClick={() => setTrimmingClip(null)}
              className="min-h-10 cursor-pointer rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 active:bg-slate-950"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => addTrimmedClip(trimmingClip)}
              disabled={!isClipRangeValid(trimmingClip)}
              className="min-h-10 cursor-pointer rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add clip
            </button>
          </>
        }
      />
    )
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col gap-3 rounded bg-slate-800 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">Add clips</span>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-100 active:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 text-sm text-slate-400">
          <span>Check videos to add them as clips</span>
          <UploadMediaAssetButton
            className="shrink-0 px-2"
            onUploaded={(opfsNames) => setClipsToBeAdded((prev) => [...prev, ...opfsNames.map(makeFullClip)])}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {!mediaAssets.length && (
            <span className="text-sm text-slate-500">No videos in the library yet — import some.</span>
          )}
          {mediaAssets.map((mediaAsset) => (
            <VideosListItem
              key={mediaAsset.opfsName}
              mediaAsset={mediaAsset}
              isChecked={checkedOpfsNames.includes(mediaAsset.opfsName)}
              onToggleChecked={() => toggleChecked(mediaAsset.opfsName)}
              onTrim={() => setTrimmingClip(makeFullClip(mediaAsset.opfsName))}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setClipsToBeAdded([])}
            disabled={!clipsToBeAdded.length}
            className="mr-auto min-h-10 cursor-pointer rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 cursor-pointer rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 active:bg-slate-950"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddClips}
            disabled={!clipsToBeAdded.length}
            className="min-h-10 cursor-pointer rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add clips
          </button>
        </div>
      </div>
    </div>
  )
}
