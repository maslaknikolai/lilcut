import { useState, type MouseEvent } from 'react'
import { Plus } from 'lucide-react'
import { ClipEditorModal } from './ClipEditorModal'
import { buildTimeline, type TimelineClip } from './projectTimeline'
import { Segment } from './Segment'
import type { Project } from './types'

type TimelineProps = {
  project: Project
  currentClipId: string | null
  projectTime: number
  onSeek: (time: number) => void
}

export function Timeline({ project, currentClipId, projectTime, onSeek }: TimelineProps) {
  const [editorState, setEditorState] = useState<{ mode: 'create' } | { mode: 'edit'; clip: TimelineClip } | null>(null)

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

      <div
        onClick={handleClick}
        className="flex h-12 cursor-pointer gap-px"
      >
        {timeline.map((timelineClip) => (
          <Segment
            key={timelineClip.id}
            project={project}
            timelineClip={timelineClip}
            isCurrent={timelineClip.id === currentClipId}
            onEdit={() => setEditorState({ mode: 'edit', clip: timelineClip })}
          />
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
