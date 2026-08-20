import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { X } from 'lucide-react'
import { mediaAssetsAtom, projectsAtom } from './atoms'
import { updateProject } from './library'
import { formatTimestamp } from './formatTimestamp'
import { readOpfsFile } from './opfs'

type EditingClip = {
  id: string
  mediaAssetOpfsName: string
  cutStart: number
  cutEnd: number
}

type ClipEditorModalProps = {
  projectId: string
  clip: EditingClip | null
  insertAt?: number
  onClose: () => void
}

export function ClipEditorModal({ projectId, clip, insertAt, onClose }: ClipEditorModalProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const setProjects = useSetAtom(projectsAtom)

  const [mediaAssetOpfsName, setMediaAssetOpfsName] = useState(
    clip?.mediaAssetOpfsName ?? mediaAssets[0]?.opfsName ?? '',
  )
  const [cutStart, setCutStart] = useState(clip?.cutStart ?? 0)
  const [cutEnd, setCutEnd] = useState(clip?.cutEnd ?? 0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const mediaAsset = mediaAssets.find((mediaAsset) => mediaAsset.opfsName === mediaAssetOpfsName)

  const openMediaAsset = useEffectEvent(() => {
    if (!mediaAsset) {
      setVideoUrl(null)
      return () => {}
    }

    let url: string | null = null
    let isCancelled = false
    readOpfsFile(mediaAsset.opfsName).then((downloadedFile) => {
      if (isCancelled) {
        return
      }
      url = URL.createObjectURL(downloadedFile)
      setVideoUrl(url)
    })

    return () => {
      isCancelled = true
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  })

  useEffect(() => openMediaAsset(), [mediaAsset])

  function handleMediaAssetChange(newMediaAssetOpfsName: string) {
    setMediaAssetOpfsName(newMediaAssetOpfsName)
    if (!clip) {
      setCutStart(0)
      setCutEnd(0)
    }
  }

  function handleSave() {
    if (!mediaAssetOpfsName || cutEnd <= cutStart) {
      return
    }

    setProjects((prev) =>
      updateProject(prev, projectId, (project) => {
        if (clip) {
          return {
            ...project,
            clips: project.clips.map((item) =>
              item.id === clip.id ? { ...item, mediaAssetOpfsName, cutStart, cutEnd } : item,
            ),
          }
        }
        const newClip = { id: crypto.randomUUID(), mediaAssetOpfsName, cutStart, cutEnd }
        const targetIndex = insertAt ?? project.clips.length
        return {
          ...project,
          clips: [...project.clips.slice(0, targetIndex), newClip, ...project.clips.slice(targetIndex)],
        }
      }),
    )
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col gap-3 rounded bg-slate-800 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">{clip ? 'Edit clip' : 'New clip'}</span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-slate-500 hover:text-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          File
          <select
            value={mediaAssetOpfsName}
            onChange={(e) => handleMediaAssetChange(e.target.value)}
            className="rounded border border-slate-700 px-2 py-1"
          >
            <option
              value=""
              disabled
            >
              Select a file
            </option>
            {mediaAssets.map((mediaAsset) => (
              <option
                key={mediaAsset.opfsName}
                value={mediaAsset.opfsName}
              >
                {mediaAsset.opfsName}
              </option>
            ))}
          </select>
        </label>

        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="max-h-64 w-full"
            onLoadedMetadata={(e) => {
              if (!clip && cutEnd === 0) {
                setCutEnd(e.currentTarget.duration)
              }
            }}
          />
        )}

        <div className="flex items-center gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
            Start ({formatTimestamp(cutStart)})
            <div className="flex gap-1">
              <input
                type="number"
                min={0}
                step={0.1}
                value={cutStart}
                onChange={(e) => setCutStart(Number(e.target.value))}
                className="w-full rounded border border-slate-700 px-2 py-1"
              />
              <button
                type="button"
                onClick={() => videoRef.current && setCutStart(videoRef.current.currentTime)}
                className="shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900"
              >
                Use current
              </button>
            </div>
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
            End ({formatTimestamp(cutEnd)})
            <div className="flex gap-1">
              <input
                type="number"
                min={0}
                step={0.1}
                value={cutEnd}
                onChange={(e) => setCutEnd(Number(e.target.value))}
                className="w-full rounded border border-slate-700 px-2 py-1"
              />
              <button
                type="button"
                onClick={() => videoRef.current && setCutEnd(videoRef.current.currentTime)}
                className="shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900"
              >
                Use current
              </button>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!mediaAssetOpfsName || cutEnd <= cutStart}
            className="cursor-pointer rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
