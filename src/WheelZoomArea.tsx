import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react'

type WheelZoomAreaProps = {
  onZoom: (zoomFactor: number, clientX: number) => void
  className?: string
  children: ReactNode
}

export function WheelZoomArea({ onZoom, className, children }: WheelZoomAreaProps) {
  const zoomAreaRef = useRef<HTMLDivElement>(null)

  const handleWheelZoom = useEffectEvent((event: WheelEvent) => {
    event.preventDefault()

    const zoomFactor = event.deltaY < 0 ? 1.25 : 0.8
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

  return (
    <div
      ref={zoomAreaRef}
      className={className}
    >
      {children}
    </div>
  )
}
