import { useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { mediaAssetsAtom, projectsAtom } from './atoms'
import { ClipRangeEditor } from './ClipRangeEditor'
import { formatTimestamp } from './formatTimestamp'
import { updateProject } from './library'
import { isClipRangeValid, type TimelineClip } from './projectTimeline'
import type { Clip } from './types'
import { UploadMediaAssetButton } from './UploadMediaAssetButton'

type ClipEditModalProps = {
  projectId: string
  clip: TimelineClip
  onClose: () => void
}

export function ClipEditModal({ projectId, clip, onClose }: ClipEditModalProps) {
  const [projects, setProjects] = useAtom(projectsAtom)
  const mediaAssets = useAtomValue(mediaAssetsAtom)

  const projectClip = projects.find((p) => p.id === projectId)?.clips.find((item) => item.id === clip.id)
  const [draftClip, setDraftClip] = useState(projectClip ?? null)

  const otherProjectClips = projects
    .filter((project) => project.id !== projectId)
    .flatMap((project) => project.clips.map((otherClip) => ({ project, otherClip })))

  if (!draftClip) {
    return null
  }

  function changeMediaAsset(opfsName: string) {
    setDraftClip((prev) => (prev ? { ...prev, mediaAssetOpfsName: opfsName } : prev))
  }

  function applyOtherProjectClip(clipId: string) {
    const source = otherProjectClips.find(({ otherClip }) => otherClip.id === clipId)
    if (!source) {
      return
    }
    setDraftClip((prev) =>
      prev
        ? {
            ...prev,
            mediaAssetOpfsName: source.otherClip.mediaAssetOpfsName,
            cutStart: source.otherClip.cutStart ?? 0,
            cutEnd: source.otherClip.cutEnd,
          }
        : prev,
    )
  }

  function saveClip(savedClip: Clip) {
    setProjects((prev) =>
      updateProject(prev, projectId, (project) => ({
        ...project,
        clips: project.clips.map((item) => (item.id === savedClip.id ? savedClip : item)),
      })),
    )
    onClose()
  }

  return (
    <ClipRangeEditor
      clip={draftClip}
      title="Edit clip"
      onClipChange={setDraftClip}
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 cursor-pointer rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 active:bg-slate-950"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => saveClip(draftClip)}
            disabled={!isClipRangeValid(draftClip)}
            className="min-h-10 cursor-pointer rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </>
      }
    >
      <label className="flex flex-col gap-1 text-sm text-slate-300">
        File
        <div className="flex gap-1">
          <select
            value={draftClip.mediaAssetOpfsName}
            onChange={(e) => changeMediaAsset(e.target.value)}
            className="min-h-10 min-w-0 flex-1 rounded border border-slate-700 px-2 py-1"
          >
            {mediaAssets.map((mediaAsset) => (
              <option
                key={mediaAsset.opfsName}
                value={mediaAsset.opfsName}
              >
                {mediaAsset.opfsName}
              </option>
            ))}
          </select>

          <UploadMediaAssetButton
            className="shrink-0 px-2"
            onUploaded={(opfsNames) => changeMediaAsset(opfsNames[0])}
          />
        </div>
      </label>

      {otherProjectClips.length > 0 && (
        <details>
          <summary className="flex min-h-10 cursor-pointer items-center text-xs text-slate-400 hover:text-slate-200 active:text-slate-100">
            Copy file and range from another project's clip
          </summary>
          <select
            value=""
            onChange={(e) => applyOtherProjectClip(e.target.value)}
            className="mt-1 min-h-10 w-full rounded border border-slate-700 px-2 py-1 text-sm text-slate-300"
          >
            <option
              value=""
              disabled
            >
              Select a clip
            </option>
            {otherProjectClips.map(({ project, otherClip }) => (
              <option
                key={otherClip.id}
                value={otherClip.id}
              >
                {project.name} — {otherClip.mediaAssetOpfsName} ({formatTimestamp(otherClip.cutStart ?? 0)}–
                {otherClip.cutEnd === undefined ? 'end' : formatTimestamp(otherClip.cutEnd)})
              </option>
            ))}
          </select>
        </details>
      )}
    </ClipRangeEditor>
  )
}
