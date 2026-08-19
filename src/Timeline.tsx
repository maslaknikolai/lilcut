import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { mediaAssetsAtom } from './atoms'
import { ClipEditorModal } from './ClipEditorModal'
import { INSERT_CLIP_BUTTON_WIDTH_PX, InsertClipButton } from './InsertClipButton'
import { buildTimeline, type TimelineClip } from './projectTimeline'
import { TimelineSegment } from './TimelineSegment'
import type { Project } from './types'

type ClipEditorState = { mode: 'create'; insertAt: number } | { mode: 'edit'; clip: TimelineClip }

type TimelineProps = {
  project: Project
  currentClipId: string | null
}

export function Timeline({ project, currentClipId }: TimelineProps) {
  const [clipEditorState, setClipEditorState] = useState<ClipEditorState | null>(null)
  const mediaAssets = useAtomValue(mediaAssetsAtom)

  const timeline = buildTimeline(project, mediaAssets)
  const totalDuration = timeline.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)
  const insertButtonsWidth = (timeline.length + 1) * INSERT_CLIP_BUTTON_WIDTH_PX

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-12">
        {timeline.flatMap((timelineClip, index) => [
          <InsertClipButton
            key={`insert-${timelineClip.id}`}
            onClick={() => setClipEditorState({ mode: 'create', insertAt: index })}
          />,
          <TimelineSegment
            key={timelineClip.id}
            project={project}
            timelineClip={timelineClip}
            totalDuration={totalDuration}
            clipCount={timeline.length}
            insertButtonsWidth={insertButtonsWidth}
            isCurrent={timelineClip.id === currentClipId}
            onEdit={() => setClipEditorState({ mode: 'edit', clip: timelineClip })}
          />,
        ])}
        <InsertClipButton onClick={() => setClipEditorState({ mode: 'create', insertAt: timeline.length })} />
      </div>

      {clipEditorState && (
        <ClipEditorModal
          projectId={project.id}
          clip={clipEditorState.mode === 'edit' ? clipEditorState.clip : null}
          insertAt={clipEditorState.mode === 'create' ? clipEditorState.insertAt : undefined}
          onClose={() => setClipEditorState(null)}
        />
      )}
    </div>
  )
}
