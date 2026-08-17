import { useState, type MouseEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronLeft, ChevronRight, Pencil, Plus, X } from 'lucide-react'
import { mediaFilesAtom, projectsAtom } from './atoms'
import { ClipEditorModal } from './ClipEditorModal'
import { buildTimeline, type TimelineClip } from './projectTimeline'
import type { Project } from './types'

type TimelineProps = {
  project: Project
  currentClipId: string | null
  projectTime: number
  onSeek: (time: number) => void
}

export function Timeline({ project, currentClipId, projectTime, onSeek }: TimelineProps) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const setProjects = useSetAtom(projectsAtom)
  const [editorState, setEditorState] = useState<
    { mode: 'create' } | { mode: 'edit'; clip: TimelineClip } | null
  >(null)

  const timeline = buildTimeline(project)
  const totalDuration = timeline.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)
  const playheadPercent = totalDuration > 0 ? (projectTime / totalDuration) * 100 : 0

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (totalDuration <= 0) {
      return
    }
    const track = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - track.left) / track.width
    onSeek(Math.min(1, Math.max(0, ratio)) * totalDuration)
  }

  function removeClip(clipId: string) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, clips: p.clips.filter((clip) => clip.id !== clipId) } : p,
      ),
    )
  }

  function moveClip(clipId: string, direction: -1 | 1) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== project.id) {
          return p
        }
        const index = p.clips.findIndex((clip) => clip.id === clipId)
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-500 uppercase">Timeline</span>
        <button
          type="button"
          onClick={() => setEditorState({ mode: 'create' })}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Plus size={12} />
          Add clip
        </button>
      </div>

      <div
        onClick={handleClick}
        className="relative h-1.5 cursor-pointer rounded-full bg-neutral-300"
      >
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-neutral-900"
          style={{ left: `${playheadPercent}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div onClick={handleClick} className="flex h-12 cursor-pointer gap-px">
        {timeline.map((timelineClip, index) => (
          <div
            key={timelineClip.id}
            style={{ flexGrow: timelineClip.duration || 1 }}
            className={`group relative flex min-w-0 items-center overflow-hidden rounded px-2 text-xs font-medium text-white ${
              timelineClip.id === currentClipId ? 'bg-neutral-900' : 'bg-neutral-500'
            }`}
          >
            <span className="truncate">
              {mediaFiles.find((file) => file.id === timelineClip.mediaFileId)?.name ??
                'Unknown file'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setEditorState({ mode: 'edit', clip: timelineClip })
              }}
              className="absolute top-0.5 left-0.5 rounded p-0.5 opacity-0 hover:bg-black/30 group-hover:opacity-100"
              aria-label="Edit clip"
            >
              <Pencil size={12} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeClip(timelineClip.id)
              }}
              className="absolute top-0.5 right-0.5 rounded p-0.5 opacity-0 hover:bg-black/30 group-hover:opacity-100"
              aria-label="Remove clip"
            >
              <X size={12} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                moveClip(timelineClip.id, -1)
              }}
              disabled={index === 0}
              className="absolute bottom-0.5 left-0.5 rounded p-0.5 opacity-0 hover:bg-black/30 group-hover:opacity-100 disabled:hidden"
              aria-label="Move clip earlier"
            >
              <ChevronLeft size={12} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                moveClip(timelineClip.id, 1)
              }}
              disabled={index === timeline.length - 1}
              className="absolute right-0.5 bottom-0.5 rounded p-0.5 opacity-0 hover:bg-black/30 group-hover:opacity-100 disabled:hidden"
              aria-label="Move clip later"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {editorState && (
        <ClipEditorModal
          projectId={project.id}
          clip={editorState.mode === 'edit' ? editorState.clip : null}
          onClose={() => setEditorState(null)}
        />
      )}
    </div>
  )
}
