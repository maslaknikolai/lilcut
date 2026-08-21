import { GripVertical } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { cn } from '@/lib/utils'

// swapped in as the browser's native drag preview so only our own scaled
// item shows while dragging, not the default ghost icon
const transparentDragImage = new Image()
transparentDragImage.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

type SortingItemProps = {
  ref?: Ref<HTMLLIElement>
  isDragging: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
  onClick: () => void
  className: string
  dragHandleLabel: string
  children: ReactNode
}

export function SortingItem({
  ref,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onClick,
  className,
  dragHandleLabel,
  children,
}: SortingItemProps) {
  const dragClassName = isDragging ? 'scale-105 shadow-md' : ''

  return (
    <li
      ref={ref}
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      className={cn('flex items-center border-b border-slate-700 transition-transform', className, dragClassName)}
    >
      <span
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setDragImage(transparentDragImage, 0, 0)
          onDragStart()
        }}
        onDragEnd={onDragEnd}
        className="touch-target cursor-grab px-1 text-slate-600 hover:text-slate-400"
        aria-label={dragHandleLabel}
      >
        <GripVertical size={16} />
      </span>

      {children}
    </li>
  )
}
