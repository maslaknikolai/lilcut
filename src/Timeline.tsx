import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { mediaAssetsAtom } from './atoms'
import { ClipEditorModal } from './ClipEditorModal'
import { INSERT_CLIP_BUTTON_WIDTH_PX, InsertClipButton } from './InsertClipButton'
import { buildTimelineClips, type TimelineClip } from './projectTimeline'
import { TimelineSegment } from './TimelineSegment'
import type { Project } from './types'

type ClipEditorState = { mode: 'create'; insertAt: number } | { mode: 'edit'; clip: TimelineClip }

type TimelineProps = {
  project: Project
  currentTimelineClipId: string | undefined
}

export function Timeline({ project, currentTimelineClipId }: TimelineProps) {
  const [clipEditorState, setClipEditorState] = useState<ClipEditorState | null>(null)
  const mediaAssets = useAtomValue(mediaAssetsAtom)

  const timelineClips = buildTimelineClips(project, mediaAssets)
  const totalDuration = timelineClips.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)
  const insertButtonsWidth = (timelineClips.length + 1) * INSERT_CLIP_BUTTON_WIDTH_PX

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-12">
        {timelineClips.flatMap((timelineClip, index) => [
          <InsertClipButton
            key={`insert-${timelineClip.id}`}
            onClick={() => setClipEditorState({ mode: 'create', insertAt: index })}
          />,
          <TimelineSegment
            key={timelineClip.id}
            project={project}
            timelineClip={timelineClip}
            totalDuration={totalDuration}
            clipCount={timelineClips.length}
            insertButtonsWidth={insertButtonsWidth}
            isCurrent={timelineClip.id === currentTimelineClipId}
            onEdit={() => setClipEditorState({ mode: 'edit', clip: timelineClip })}
          />,
        ])}
        <InsertClipButton onClick={() => setClipEditorState({ mode: 'create', insertAt: timelineClips.length })} />
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
