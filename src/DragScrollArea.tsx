import { useRef, type MouseEvent, type ReactNode, type Ref } from 'react'
import { cn } from '@/lib/utils'

type DragScrollAreaProps = {
  ref?: Ref<HTMLDivElement>
  className?: string
  children: ReactNode
}

export function DragScrollArea({ ref, className, children }: DragScrollAreaProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function handleScrollDragStart(event: MouseEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }
    event.preventDefault()

    const startX = event.clientX
    const startScrollLeft = scroller.scrollLeft

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      scroller.scrollLeft = startScrollLeft + (startX - moveEvent.clientX)
    }
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={(node) => {
        scrollerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      onMouseDown={handleScrollDragStart}
      className={cn('overflow-x-auto', className)}
    >
      {children}
    </div>
  )
}
