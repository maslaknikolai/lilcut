import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronLeft, ChevronRight, Files, FileX, Pencil, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { mediaAssetsAtom, projectsAtom } from './atoms'
import { updateProject } from './library'
import type { TimelineClip } from './projectTimeline'
import { TimelineClipAction } from './TimelineClipAction'
import type { Project } from './types'
import { useScrollCurrentIntoView } from './useScrollCurrentIntoView'

type SegmentProps = {
  project: Project
  timelineClip: TimelineClip
  pxPerSecond: number
  isCurrent: boolean
  onEdit: () => void
  onSeekToStart: () => void
}

export function TimelineClip({ project, timelineClip, pxPerSecond, isCurrent, onEdit, onSeekToStart }: SegmentProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const setProjects = useSetAtom(projectsAtom)
  const rootRef = useScrollCurrentIntoView(isCurrent)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const mediaAssetExists = mediaAssets.some((mediaAsset) => mediaAsset.opfsName === timelineClip.mediaAssetOpfsName)
  const mediaAssetName = mediaAssetExists ? timelineClip.mediaAssetOpfsName : 'Unknown file'
  const clipIndex = project.clips.findIndex((clip) => clip.id === timelineClip.id)
  const isFirst = clipIndex === 0
  const isLast = clipIndex === project.clips.length - 1

  function removeClip() {
    setProjects((prev) =>
      updateProject(prev, project.id, (p) => {
        const clips = p.clips.filter((clip) => clip.id !== timelineClip.id)
        return { ...p, clips }
      }),
    )
  }

  function cloneClip() {
    setProjects((prev) =>
      updateProject(prev, project.id, (p) => {
        const index = p.clips.findIndex((clip) => clip.id === timelineClip.id)
        if (index === -1) {
          return p
        }
        const clonedClip = { ...p.clips[index], id: crypto.randomUUID() }
        const clips = [...p.clips.slice(0, index + 1), clonedClip, ...p.clips.slice(index + 1)]
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
    <Tooltip
      open={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
    >
      <TooltipTrigger asChild>
        <div
          ref={rootRef}
          onClick={() => setIsTooltipOpen((prev) => !prev)}
          onDoubleClick={onSeekToStart}
          className={`relative flex shrink-0 items-center rounded text-xs font-medium ${
            isCurrent ? 'bg-slate-300 text-slate-900' : 'bg-slate-500 text-white'
          }`}
          style={{ width: timelineClip.duration * pxPerSecond }}
        >
          {!mediaAssetExists && (
            <FileX
              size={12}
              className="mr-1 shrink-0"
            />
          )}
          <span className="min-w-0 truncate px-3">{mediaAssetName}</span>
        </div>
      </TooltipTrigger>

      <TooltipContent
        sideOffset={-8}
        className="gap-0.5 p-0.5"
      >
        <TimelineClipAction
          onClick={() => moveClip(-1)}
          disabled={isFirst}
          label="Move clip earlier"
        >
          <ChevronLeft size={16} />
        </TimelineClipAction>

        <TimelineClipAction
          onClick={() => moveClip(1)}
          disabled={isLast}
          label="Move clip later"
        >
          <ChevronRight size={16} />
        </TimelineClipAction>

        <TimelineClipAction
          onClick={onEdit}
          label="Edit clip"
        >
          <Pencil size={16} />
        </TimelineClipAction>

        <TimelineClipAction
          onClick={cloneClip}
          label="Clone clip"
        >
          <Files size={16} />
        </TimelineClipAction>

        <TimelineClipAction
          onClick={removeClip}
          label="Remove clip"
        >
          <X size={16} />
        </TimelineClipAction>
      </TooltipContent>
    </Tooltip>
  )
}
