import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'

// swapped in as the browser's native drag preview so only our own scaled
// item shows while dragging, not the default ghost icon
const transparentDragImage = new Image()
transparentDragImage.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

type SortingItemProps = {
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
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      className={`flex items-center border-b border-neutral-700 transition-transform ${className} ${dragClassName}`}
    >
      <span
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setDragImage(transparentDragImage, 0, 0)
          onDragStart()
        }}
        onDragEnd={onDragEnd}
        className="cursor-grab px-1 text-neutral-600 hover:text-neutral-400"
        aria-label={dragHandleLabel}
      >
        <GripVertical size={16} />
      </span>

      {children}
    </li>
  )
}
