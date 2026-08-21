import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { activeModalAtom, mediaAssetsAtom } from './atoms'
import { DragScrollArea } from './DragScrollArea'
import { InsertClipButton } from './InsertClipButton'
import { buildTimelineClips, type TimelineClip as TimelineClipT } from './projectTimeline'
import { Scrubber } from './Scrubber'
import { TimelineClip } from './TimelineClip'
import type { Project } from './types'
import { WheelZoomArea } from './WheelZoomArea'

type TimelineProps = {
  project: Project
  currentTimelineClipId: string | undefined
  projectTime: number
  onSeek: (time: number) => void
}

const MAX_PX_PER_SECOND = 500

export function Timeline({ project, currentTimelineClipId, projectTime, onSeek }: TimelineProps) {
  const [pxPerSecond, setPxPerSecond] = useState<number | null>(null)
  const setActiveModal = useSetAtom(activeModalAtom)

  function openClipCreator(insertAt: number) {
    setActiveModal({ type: 'clipEditor', projectId: project.id, clip: null, insertAt })
  }

  function openClipEditor(clip: TimelineClipT) {
    setActiveModal({ type: 'clipEditor', projectId: project.id, clip })
  }
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const timelineClips = buildTimelineClips(project, mediaAssets)
  const totalDuration = timelineClips.reduce((sum, timelineClip) => sum + timelineClip.duration, 0)

  const minPxPerSecondRef = useRef(0)

  const applyFillZoom = useEffectEvent(() => {
    const scroller = scrollerRef.current
    if (!scroller || totalDuration <= 0) {
      return
    }
    const scrollerStyles = getComputedStyle(scroller)
    const scrollerPadding = parseFloat(scrollerStyles.paddingLeft) + parseFloat(scrollerStyles.paddingRight)
    const rowGapsWidth = 2 * timelineClips.length
    const fillPxPerSecond = (scroller.clientWidth - scrollerPadding - rowGapsWidth) / totalDuration
    minPxPerSecondRef.current = fillPxPerSecond
    setPxPerSecond((prev) => (prev === null ? fillPxPerSecond : Math.max(prev, fillPxPerSecond)))
  })

  useLayoutEffect(() => {
    applyFillZoom()
  }, [totalDuration])

  const pendingScrollLeftRef = useRef<number | null>(null)

  function handleZoom(zoomFactor: number, clientX: number) {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }

    const oldPxPerSecond = pxPerSecond ?? minPxPerSecondRef.current
    const newPxPerSecond = Math.min(MAX_PX_PER_SECOND, Math.max(minPxPerSecondRef.current, oldPxPerSecond * zoomFactor))
    if (newPxPerSecond === oldPxPerSecond) {
      return
    }

    const cursorX = clientX - scroller.getBoundingClientRect().left
    const scaleRatio = newPxPerSecond / oldPxPerSecond
    pendingScrollLeftRef.current = (scroller.scrollLeft + cursorX) * scaleRatio - cursorX
    setPxPerSecond(newPxPerSecond)
  }

  const applyPendingZoomScroll = useEffectEvent(() => {
    const scroller = scrollerRef.current
    if (scroller && pendingScrollLeftRef.current !== null) {
      scroller.scrollLeft = pendingScrollLeftRef.current
      pendingScrollLeftRef.current = null
    }
  })

  useLayoutEffect(() => {
    applyPendingZoomScroll()
  }, [pxPerSecond])

  return (
    <DragScrollArea
      ref={scrollerRef}
      className="overflow-x-scroll pb-1 px-4 [scrollbar-color:var(--color-slate-600)_transparent] scrollbar-thin"
    >
      <WheelZoomArea
        onZoom={handleZoom}
        className="flex w-fit min-w-full flex-col gap-4"
      >
        <Scrubber
          projectTime={projectTime}
          totalDuration={totalDuration}
          onSeek={onSeek}
        />

        <div className="flex h-12 gap-px">
          {timelineClips.length === 0 && (
            <button
              type="button"
              onClick={() => openClipCreator(0)}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-slate-700 text-sm text-slate-400 hover:border-slate-500 hover:text-slate-200"
            >
              <Plus size={14} />
              Add clip
            </button>
          )}
          {timelineClips.flatMap((timelineClip, index) => [
            <InsertClipButton
              key={`insert-${timelineClip.id}`}
              className={index === 0 ? 'left-0' : undefined}
              onClick={() => openClipCreator(index)}
            />,
            <TimelineClip
              key={timelineClip.id}
              project={project}
              timelineClip={timelineClip}
              pxPerSecond={pxPerSecond ?? 0}
              isCurrent={timelineClip.id === currentTimelineClipId}
              onEdit={() => openClipEditor(timelineClip)}
            />,
          ])}
          {timelineClips.length > 0 && (
            <InsertClipButton
              className="-left-4"
              onClick={() => openClipCreator(timelineClips.length)}
            />
          )}
        </div>
      </WheelZoomArea>
    </DragScrollArea>
  )
}
