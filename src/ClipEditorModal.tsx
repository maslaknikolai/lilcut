import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Play, X } from 'lucide-react'
import { mediaAssetsAtom, projectsAtom } from './atoms'
import { ClipTrimBar } from './ClipTrimBar'
import { updateProject } from './library'
import type { TimelineClip } from './projectTimeline'
import { formatTimestamp } from './formatTimestamp'
import { readOpfsFile } from './opfs'

function roundTime(time: number): number {
  return Math.round(time * 100) / 100
}

type ClipEditorModalProps = {
  projectId: string
  clip: TimelineClip | null
  insertAt?: number
  onClose: () => void
}

export function ClipEditorModal({ projectId, clip, insertAt, onClose }: ClipEditorModalProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const projects = useAtomValue(projectsAtom)
  const setProjects = useSetAtom(projectsAtom)

  const [mediaAssetOpfsName, setMediaAssetOpfsName] = useState(
    clip?.mediaAssetOpfsName ?? mediaAssets[0]?.opfsName ?? '',
  )
  const [cutStart, setCutStart] = useState(roundTime(clip?.cutStart ?? 0))
  const [cutEnd, setCutEnd] = useState(roundTime(clip?.cutEnd ?? 0))
  const rawClip = projects.find((p) => p.id === projectId)?.clips.find((item) => item.id === clip?.id)
  const [isToVideoEnd, setIsToVideoEnd] = useState(clip !== null && rawClip?.cutEnd === undefined)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isPreviewingRef = useRef(false)

  const mediaAsset = mediaAssets.find((mediaAsset) => mediaAsset.opfsName === mediaAssetOpfsName)

  const otherProjectClips = projects
    .filter((project) => project.id !== projectId)
    .flatMap((project) => project.clips.map((projectClip) => ({ project, projectClip })))

  function applyOtherProjectClip(clipId: string) {
    const source = otherProjectClips.find(({ projectClip }) => projectClip.id === clipId)
    if (!source) {
      return
    }
    setMediaAssetOpfsName(source.projectClip.mediaAssetOpfsName)
    setCutStart(roundTime(source.projectClip.cutStart ?? 0))
    setCutEnd(roundTime(source.projectClip.cutEnd ?? 0))
    setIsToVideoEnd(source.projectClip.cutEnd === undefined)
  }

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

  function captureCutStart() {
    const video = videoRef.current
    if (!video) {
      return
    }
    const roundedTime = roundTime(video.currentTime)
    setCutStart(roundedTime)
  }

  function captureCutEnd() {
    const video = videoRef.current
    if (!video) {
      return
    }
    const roundedTime = roundTime(video.currentTime)
    setCutEnd(roundedTime)
  }

  function previewRange() {
    const video = videoRef.current
    if (!video) {
      return
    }
    isPreviewingRef.current = true
    video.currentTime = cutStart
    video.play()
  }

  function handleSave() {
    if (!mediaAssetOpfsName || (!isToVideoEnd && cutEnd <= cutStart)) {
      return
    }

    const savedCutEnd = isToVideoEnd ? undefined : cutEnd

    setProjects((prev) =>
      updateProject(prev, projectId, (project) => {
        if (clip) {
          return {
            ...project,
            clips: project.clips.map((item) =>
              item.id === clip.id ? { ...item, mediaAssetOpfsName, cutStart, cutEnd: savedCutEnd } : item,
            ),
          }
        }
        const newClip = { id: crypto.randomUUID(), mediaAssetOpfsName, cutStart, cutEnd: savedCutEnd }
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
        className="flex h-full w-full flex-col gap-3 rounded bg-slate-800 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">{clip ? 'Edit clip' : 'New clip'}</span>
          <button
            type="button"
            onClick={onClose}
            className="touch-target cursor-pointer text-slate-500 hover:text-slate-100"
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
            className="min-h-10 rounded border border-slate-700 px-2 py-1"
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

        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="min-h-0 w-full flex-1"
            onLoadedMetadata={(e) => {
              if (!clip && cutEnd === 0) {
                setCutEnd(roundTime(e.currentTarget.duration))
              }
            }}
            onTimeUpdate={(e) => {
              setCurrentTime(e.currentTarget.currentTime)
              if (isPreviewingRef.current && !isToVideoEnd && e.currentTarget.currentTime >= cutEnd) {
                e.currentTarget.pause()
              }
            }}
            onPause={() => {
              isPreviewingRef.current = false
            }}
          />
        ) : (
          <div className="flex-1" />
        )}

        {mediaAsset && (
          <ClipTrimBar
            duration={mediaAsset.duration}
            cutStart={cutStart}
            cutEnd={cutEnd}
            isToVideoEnd={isToVideoEnd}
            currentTime={currentTime}
            onRangeChange={(newCutStart, newCutEnd) => {
              let seekTarget: number | null = null
              if (newCutStart !== cutStart) {
                setCutStart(roundTime(newCutStart))
                seekTarget = newCutStart
              }
              if (newCutEnd !== undefined && newCutEnd !== cutEnd) {
                setCutEnd(roundTime(newCutEnd))
                seekTarget = newCutEnd
              }
              if (seekTarget !== null && videoRef.current) {
                videoRef.current.currentTime = seekTarget
              }
            }}
          />
        )}

        <div className="flex items-start gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
            Start ({formatTimestamp(cutStart)})
            <div className="flex gap-1">
              <input
                type="number"
                min={0}
                step={0.01}
                value={cutStart}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setCutStart(value)
                  if (videoRef.current) {
                    videoRef.current.currentTime = value
                  }
                }}
                className="min-h-10 w-full rounded border border-slate-700 px-2 py-1"
              />
              <button
                type="button"
                onClick={captureCutStart}
                className="touch-target shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900"
              >
                Use current
              </button>
            </div>
          </label>

          <div className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
            End ({isToVideoEnd ? 'video end' : formatTimestamp(cutEnd)})
            <div className="flex gap-1">
              <input
                type="number"
                min={0}
                step={0.01}
                value={cutEnd}
                disabled={isToVideoEnd}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setCutEnd(value)
                  if (videoRef.current) {
                    videoRef.current.currentTime = value
                  }
                }}
                className="min-h-10 w-full rounded border border-slate-700 px-2 py-1 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={captureCutEnd}
                disabled={isToVideoEnd}
                className="touch-target shrink-0 cursor-pointer rounded border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Use current
              </button>
            </div>
            <label className="touch-target flex cursor-pointer items-center gap-1.5 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={isToVideoEnd}
                onChange={(e) => setIsToVideoEnd(e.target.checked)}
              />
              To the end of the video
            </label>
          </div>
        </div>

        {otherProjectClips.length > 0 && (
          <details>
            <summary className="touch-target cursor-pointer text-xs text-slate-400 hover:text-slate-200">
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
              {otherProjectClips.map(({ project, projectClip }) => (
                <option
                  key={projectClip.id}
                  value={projectClip.id}
                >
                  {project.name} — {projectClip.mediaAssetOpfsName} (
                  {formatTimestamp(roundTime(projectClip.cutStart ?? 0))}–
                  {projectClip.cutEnd === undefined ? 'end' : formatTimestamp(roundTime(projectClip.cutEnd))})
                </option>
              ))}
            </select>
          </details>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={previewRange}
            disabled={!videoUrl || (!isToVideoEnd && cutEnd <= cutStart)}
            className="touch-target mr-auto flex cursor-pointer items-center gap-1.5 rounded border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={14} />
            Preview range
          </button>

          <button
            type="button"
            onClick={onClose}
            className="touch-target cursor-pointer rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!mediaAssetOpfsName || (!isToVideoEnd && cutEnd <= cutStart)}
            className="touch-target cursor-pointer rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {clip ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
