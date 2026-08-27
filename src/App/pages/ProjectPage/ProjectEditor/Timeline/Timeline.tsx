import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Shrink } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { activeModalAtom, ModalType, videosAtom } from '@/App/atoms'
import { DragScrollArea } from '@/App/pages/ProjectPage/ProjectEditor/Timeline/DragScrollArea'
import { GhostButton } from '@/App/lib/GhostButton'
import { InsertClipButton } from '@/App/pages/ProjectPage/ProjectEditor/Timeline/InsertClipButton'
import { buildTimelineClips, EMPTY_CLIP_WIDTH, type TimelineClip as TimelineClipT } from '@/App/lib/projectTimeline'
import { Scrubber } from '@/App/pages/ProjectPage/ProjectEditor/Timeline/Scrubber'
import { TimelineClip } from '@/App/pages/ProjectPage/ProjectEditor/Timeline/TimelineClip'
import type { Project } from '@/App/lib/types'
import { useKeyPress } from '@/App/lib/useKeyPress'
import { useOnResize } from '@/App/lib/useOnResize'
import { ZoomArea } from '@/App/pages/ProjectPage/ProjectEditor/Timeline/ZoomArea'

type TimelineProps = {
  project: Project
  currentTimelineClipId: string | undefined
  projectTime: number
  onSeek: (time: number) => void
  fitZoomSlot?: HTMLElement | null
}

const MAX_PX_PER_SECOND = 500

export function Timeline({ project, currentTimelineClipId, projectTime, onSeek, fitZoomSlot }: TimelineProps) {
  const [pxPerSecond, setPxPerSecond] = useState<number | null>(null)
  const setActiveModal = useSetAtom(activeModalAtom)

  function openClipCreator(insertAt: number) {
    setActiveModal({ type: ModalType.ClipCreate, projectId: project.id, insertAt })
  }

  function openClipEditor(clip: TimelineClipT) {
    setActiveModal({ type: ModalType.ClipEdit, projectId: project.id, clip })
  }
  const videos = useAtomValue(videosAtom)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const timelineClips = buildTimelineClips(project.clips, videos)
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
    // empty clips keep a fixed width, so pixels instead of seconds
    const emptyClips = timelineClips.filter((timelineClip) => !timelineClip.duration)
    const emptyClipsWidth = emptyClips.length * EMPTY_CLIP_WIDTH
    const availableWidth = scroller.clientWidth - scrollerPadding - rowGapsWidth - emptyClipsWidth
    const fillPxPerSecond = availableWidth / totalDuration
    // the user never zoomed in — keep it fitted through changes
    const isFitted = pxPerSecond === null || pxPerSecond === minPxPerSecondRef.current
    minPxPerSecondRef.current = fillPxPerSecond
    setPxPerSecond(isFitted ? fillPxPerSecond : Math.max(pxPerSecond, fillPxPerSecond))
  })

  useLayoutEffect(() => {
    applyFillZoom()
  }, [totalDuration])

  useOnResize(scrollerRef, applyFillZoom)

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

  function fitZoom() {
    setPxPerSecond(minPxPerSecondRef.current)
  }

  useKeyPress('Digit0', fitZoom)

  const isZoomedIn = (pxPerSecond ?? 0) > minPxPerSecondRef.current

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
    <>
      {fitZoomSlot &&
        isZoomedIn &&
        createPortal(
          <GhostButton
            onClick={fitZoom}
            tooltip="Fit timeline to width (0)"
            aria-label="Fit timeline to width"
            className="shrink-0 px-2"
          >
            <Shrink size={14} />
          </GhostButton>,
          fitZoomSlot,
        )}

      <DragScrollArea
        ref={scrollerRef}
        className="overflow-x-scroll pb-10 px-4"
      >
        <ZoomArea
          onZoom={handleZoom}
          className="flex w-fit min-w-full flex-col gap-4"
        >
          <Scrubber
            timelineClips={timelineClips}
            projectTime={projectTime}
            pxPerSecond={pxPerSecond ?? 0}
            onSeek={onSeek}
          />

          {timelineClips.length ? (
            <div className="flex h-20 md:h-12">
              {timelineClips.flatMap((timelineClip, index) => [
                <InsertClipButton
                  key={`insert-${timelineClip.id}`}
                  onClick={() => openClipCreator(index)}
                />,
                <TimelineClip
                  key={timelineClip.id}
                  project={project}
                  timelineClip={timelineClip}
                  pxPerSecond={pxPerSecond ?? 0}
                  isCurrent={timelineClip.id === currentTimelineClipId}
                  onEdit={() => openClipEditor(timelineClip)}
                  onSeekToStart={() => onSeek(timelineClip.projectStart)}
                />,
              ])}
              {timelineClips.length > 0 && <InsertClipButton onClick={() => openClipCreator(timelineClips.length)} />}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openClipCreator(0)}
              className="h-20 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-slate-700 text-sm text-slate-400 hover:border-slate-500 hover:text-slate-200 active:border-slate-400 active:text-slate-100 md:h-12"
            >
              <Plus size={14} />
              Add clip
            </button>
          )}
        </ZoomArea>
      </DragScrollArea>
    </>
  )
}
