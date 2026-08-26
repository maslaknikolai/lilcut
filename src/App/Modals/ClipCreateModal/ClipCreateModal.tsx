import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { projectsAtom } from '@/App/atoms'
import { Modal } from '@/App/Modals/Modal'
import { ClipRangeEditor } from '@/App/Modals/ClipRangeEditor/ClipRangeEditor'
import { updateProject } from '@/App/lib/library'
import { isClipRangeValid, isDefaultClip, makeFullClip } from '@/App/lib/projectTimeline'
import type { Clip } from '@/App/lib/types'
import { UploadVideoButton } from '@/App/lib/UploadVideoButton'
import { useOrderedVideos } from '@/App/Modals/ClipCreateModal/useOrderedVideos'
import { VideosListItem } from '@/App/Modals/ClipCreateModal/VideosListItem'

type ClipCreateModalProps = {
  projectId: string
  insertAt?: number
  onClose: () => void
}

export function ClipCreateModal({ projectId, insertAt, onClose }: ClipCreateModalProps) {
  const setProjects = useSetAtom(projectsAtom)
  const videos = useOrderedVideos()
  const [clipsToBeAdded, setClipsToBeAdded] = useState<Clip[]>([])
  const [trimmingClip, setTrimmingClip] = useState<Clip | null>(null)

  function toggleChecked(opfsName: string) {
    setClipsToBeAdded((prev) => {
      const isChecked = prev.some((clip) => clip.videoOpfsName === opfsName)
      if (isChecked) {
        return prev.filter((clip) => clip.videoOpfsName !== opfsName)
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

  // trimming an already-pending clip edits it in place; a fresh one is appended
  function openTrimmer(opfsName: string) {
    const existingClip = clipsToBeAdded.find((clip) => clip.videoOpfsName === opfsName)
    setTrimmingClip(existingClip ?? makeFullClip(opfsName))
  }

  function addTrimmedClip(trimmedClip: Clip) {
    setClipsToBeAdded((prev) => {
      const isExisting = prev.some((clip) => clip.id === trimmedClip.id)
      if (isExisting) {
        return prev.map((clip) => (clip.id === trimmedClip.id ? trimmedClip : clip))
      }
      return [...prev, trimmedClip]
    })
    setTrimmingClip(null)
  }

  if (trimmingClip) {
    return (
      <ClipRangeEditor
        clip={trimmingClip}
        title="New clip"
        onClipChange={setTrimmingClip}
        onBack={() => setTrimmingClip(null)}
        onClose={() => setTrimmingClip(null)}
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
    <Modal
      title="Add clips"
      onClose={onClose}
      className="h-full max-w-none"
    >
      <div className="flex items-center justify-between gap-2 text-sm text-slate-400">
        <span>Check videos to add them as clips</span>
        <UploadVideoButton
          className="shrink-0 px-2"
          onUploaded={(opfsNames) => setClipsToBeAdded((prev) => [...prev, ...opfsNames.map(makeFullClip)])}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {!videos.length && <span className="text-sm text-slate-500">No videos in the library yet — import some.</span>}
        {videos.map((video) => {
          const assetClip = clipsToBeAdded.find((clip) => clip.videoOpfsName === video.opfsName)
          const isModified = !!assetClip && !isDefaultClip(assetClip)
          return (
            <VideosListItem
              key={video.opfsName}
              video={video}
              isChecked={!!assetClip}
              isModified={isModified}
              onToggleChecked={() => toggleChecked(video.opfsName)}
              onTrim={() => openTrimmer(video.opfsName)}
            />
          )
        })}
      </div>

      <div className="flex justify-end gap-2">
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
    </Modal>
  )
}
