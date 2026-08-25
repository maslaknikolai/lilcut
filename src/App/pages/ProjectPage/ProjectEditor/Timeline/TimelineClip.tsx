import { useRef, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronLeft, ChevronRight, Files, FileX, Pencil, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/App/lib/ui/tooltip'
import { videosAtom, projectsAtom } from '@/App/atoms'
import { updateProject } from '@/App/lib/library'
import type { TimelineClip } from '@/App/lib/projectTimeline'
import { TimelineClipAction } from '@/App/pages/ProjectPage/ProjectEditor/Timeline/TimelineClipAction'
import type { Project } from '@/App/lib/types'
import { useScrollCurrentIntoView } from '@/App/lib/useScrollCurrentIntoView'
import { cn } from '@/App/lib/utils'

type TimelineClipProps = {
  project: Project
  timelineClip: TimelineClip
  pxPerSecond: number
  isCurrent: boolean
  onEdit: () => void
  onSeekToStart: () => void
}

export function TimelineClip({
  project,
  timelineClip,
  pxPerSecond,
  isCurrent,
  onEdit,
  onSeekToStart,
}: TimelineClipProps) {
  const videos = useAtomValue(videosAtom)
  const setProjects = useSetAtom(projectsAtom)
  const rootRef = useScrollCurrentIntoView(isCurrent)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  // Radix closes the tooltip itself on trigger pointerdown; remembering the
  // pre-tap state stops the click from immediately reopening it
  const wasTooltipOpenOnPointerDownRef = useRef(false)

  const videoExists = videos.some((video) => video.opfsName === timelineClip.videoOpfsName)
  const videoName = videoExists ? timelineClip.videoOpfsName : 'Unknown file'
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
          onPointerDown={() => {
            wasTooltipOpenOnPointerDownRef.current = isTooltipOpen
          }}
          onClick={() => {
            if (!wasTooltipOpenOnPointerDownRef.current) {
              setIsTooltipOpen(true)
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            setIsTooltipOpen(true)
          }}
          onDoubleClick={onSeekToStart}
          className={cn(
            'relative flex shrink-0 items-center rounded text-xs font-medium select-none [-webkit-touch-callout:none]',
            isCurrent ? 'bg-slate-300 text-slate-900' : 'bg-slate-500 text-white',
            isTooltipOpen && 'outline-2 outline-offset-2 outline-slate-100',
          )}
          style={{ width: timelineClip.duration * pxPerSecond }}
        >
          {!videoExists && (
            <FileX
              size={12}
              className="mr-1 shrink-0"
            />
          )}
          <span className="min-w-0 truncate px-3">{videoName}</span>
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
          onClick={() => {
            setIsTooltipOpen(false)
            onEdit()
          }}
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
