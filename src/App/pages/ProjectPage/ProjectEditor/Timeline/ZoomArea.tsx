import { useEffect, useEffectEvent, useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/App/lib/utils'

type ZoomAreaProps = {
  onZoom: (zoomFactor: number, clientX: number) => void
  className?: string
  children: ReactNode
}

type TrackedPointer = {
  clientX: number
  clientY: number
}

export function ZoomArea({ onZoom, className, children }: ZoomAreaProps) {
  const zoomAreaRef = useRef<HTMLDivElement>(null)
  const touchPointersRef = useRef(new Map<number, TrackedPointer>())

  const handleWheelZoom = useEffectEvent((event: WheelEvent) => {
    event.preventDefault()

    const zoomFactor = Math.exp(-event.deltaY * 0.001)
    onZoom(zoomFactor, event.clientX)
  })

  // React's synthetic onWheel can't preventDefault reliably (passive listener),
  // so the zoom listener is attached natively with passive: false
  useEffect(() => {
    const zoomArea = zoomAreaRef.current
    if (!zoomArea) {
      return
    }
    const listener = (event: WheelEvent) => handleWheelZoom(event)
    zoomArea.addEventListener('wheel', listener, { passive: false })
    return () => zoomArea.removeEventListener('wheel', listener)
  }, [])

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch') {
      return
    }
    touchPointersRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch') {
      return
    }
    const touchPointers = touchPointersRef.current
    const previous = touchPointers.get(event.pointerId)
    if (!previous) {
      return
    }

    // two fingers: pinch zoom around the midpoint
    if (touchPointers.size === 2) {
      const [pointerA, pointerB] = [...touchPointers.values()]
      const previousDistance = Math.hypot(pointerA.clientX - pointerB.clientX, pointerA.clientY - pointerB.clientY)

      touchPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })

      const [movedPointerA, movedPointerB] = [...touchPointers.values()]
      const distance = Math.hypot(
        movedPointerA.clientX - movedPointerB.clientX,
        movedPointerA.clientY - movedPointerB.clientY,
      )
      const midpointX = (movedPointerA.clientX + movedPointerB.clientX) / 2

      if (previousDistance > 0 && distance > 0) {
        onZoom(distance / previousDistance, midpointX)
      }
      return
    }

    // one finger: pan — touch-none disabled the native scroll, and the parent
    // is the scroller (DragScrollArea)
    const scroller = zoomAreaRef.current?.parentElement
    if (scroller) {
      scroller.scrollLeft -= event.clientX - previous.clientX
    }
    touchPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    touchPointersRef.current.delete(event.pointerId)
  }

  return (
    <div
      ref={zoomAreaRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      className={cn('touch-none', className)}
    >
      {children}
    </div>
  )
}
