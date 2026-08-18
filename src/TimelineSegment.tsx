import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react'
import { mediaFilesAtom, projectsAtom } from './atoms'
import type { TimelineClip } from './projectTimeline'
import type { Project } from './types'

type SegmentProps = {
  project: Project
  timelineClip: TimelineClip
  totalDuration: number
  insertButtonsWidth: number
  isCurrent: boolean
  onEdit: () => void
}

export function TimelineSegment({
  project,
  timelineClip,
  totalDuration,
  insertButtonsWidth,
  isCurrent,
  onEdit,
}: SegmentProps) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const setProjects = useSetAtom(projectsAtom)

  const mediaFileName = mediaFiles.find((file) => file.id === timelineClip.mediaFileId)?.name ?? 'Unknown file'
  const clipIndex = project.clips.findIndex((clip) => clip.id === timelineClip.id)
  const isFirst = clipIndex === 0
  const isLast = clipIndex === project.clips.length - 1
  const durationRatio = totalDuration > 0 ? timelineClip.duration / totalDuration : 0

  function removeClip() {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, clips: p.clips.filter((clip) => clip.id !== timelineClip.id) } : p,
      ),
    )
  }

  function moveClip(direction: -1 | 1) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== project.id) {
          return p
        }
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
      <span className="truncate">{mediaFileName}</span>

      <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            moveClip(-1)
          }}
          disabled={isFirst}
          className="rounded p-0.5 hover:bg-black/30 disabled:hidden"
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
          className="rounded p-0.5 hover:bg-black/30 disabled:hidden"
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
          className="rounded p-0.5 hover:bg-black/30"
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
          className="rounded p-0.5 hover:bg-black/30"
          aria-label="Remove clip"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
