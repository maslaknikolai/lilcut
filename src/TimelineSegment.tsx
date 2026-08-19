import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronLeft, ChevronRight, FileX, Pencil, X } from 'lucide-react'
import { mediaAssetsAtom, projectsAtom } from './atoms'
import { updateProject } from './library'
import type { TimelineClip } from './projectTimeline'
import type { Project } from './types'

type SegmentProps = {
  project: Project
  timelineClip: TimelineClip
  totalDuration: number
  clipCount: number
  insertButtonsWidth: number
  isCurrent: boolean
  onEdit: () => void
}

export function TimelineSegment({
  project,
  timelineClip,
  totalDuration,
  clipCount,
  insertButtonsWidth,
  isCurrent,
  onEdit,
}: SegmentProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const setProjects = useSetAtom(projectsAtom)

  const mediaAssetExists = mediaAssets.some((mediaAsset) => mediaAsset.opfsName === timelineClip.mediaAssetOpfsName)
  const mediaAssetName = mediaAssetExists ? timelineClip.mediaAssetOpfsName : 'Unknown file'
  const clipIndex = project.clips.findIndex((clip) => clip.id === timelineClip.id)
  const isFirst = clipIndex === 0
  const isLast = clipIndex === project.clips.length - 1
  // totalDuration can be 0 when no clip's duration is known (e.g. its file is
  // missing) — fall back to splitting width evenly so segments stay visible
  // and clickable instead of collapsing to zero
  const durationRatio = totalDuration > 0 ? timelineClip.duration / totalDuration : 1 / clipCount

  function removeClip() {
    setProjects((prev) =>
      updateProject(prev, project.id, (p) => {
        const clips = p.clips.filter((clip) => clip.id !== timelineClip.id)
        return { ...p, clips }
      }),
    )
  }

  function moveClip(direction: -1 | 1) {
    setProjects((prev) =>
      updateProject(prev, project.id, (p) => {
        const index = p.clips.findIndex((clip) => clip.id === timelineClip.id)
        const targetIndex = index + direction
        if (index === -1 || targetIndex < 0 || targetIndex >= p.clips.length) {
          return p
        }
        const clips = [...p.clips]
        const [moved] = clips.splice(index, 1)
        clips.splice(targetIndex, 0, moved)
        return { ...p, clips }
      }),
    )
  }

  return (
    <div
      className={`group relative flex min-w-0 items-center overflow-hidden rounded px-2 text-xs font-medium text-white ${
        isCurrent ? 'bg-neutral-900' : 'bg-neutral-500'
      }`}
      style={{ flex: `0 0 calc((100% - ${insertButtonsWidth}px) * ${durationRatio})` }}
    >
      {!mediaAssetExists && (
        <FileX
          size={12}
          className="mr-1 shrink-0"
        />
      )}
      <span className="truncate">{mediaAssetName}</span>

      <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            moveClip(-1)
          }}
          disabled={isFirst}
          className="cursor-pointer rounded p-0.5 hover:bg-black/30 disabled:hidden"
          aria-label="Move clip earlier"
        >
          <ChevronLeft size={12} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            moveClip(1)
          }}
          disabled={isLast}
          className="cursor-pointer rounded p-0.5 hover:bg-black/30 disabled:hidden"
          aria-label="Move clip later"
        >
          <ChevronRight size={12} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="cursor-pointer rounded p-0.5 hover:bg-black/30"
          aria-label="Edit clip"
        >
          <Pencil size={12} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            removeClip()
          }}
          className="cursor-pointer rounded p-0.5 hover:bg-black/30"
          aria-label="Remove clip"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
