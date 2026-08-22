import { GripVertical } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

type SortingItemProps = {
  ref?: Ref<HTMLLIElement>
  id: string
  onClick?: () => void
  className: string
  dragHandleLabel: string
  children: ReactNode
}

export function SortingItem({ ref, id, onClick, className, dragHandleLabel, children }: SortingItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  function setRefs(node: HTMLLIElement | null) {
    setNodeRef(node)
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  return (
    <li
      ref={setRefs}
      onClick={onClick}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center border-b border-slate-700', className, isDragging && 'relative z-10 shadow-md')}
    >
      <span
        {...attributes}
        {...listeners}
        className="touch-target cursor-grab touch-none px-1 text-slate-600 hover:text-slate-400 active:cursor-grabbing active:text-slate-300"
        aria-label={dragHandleLabel}
      >
        <GripVertical size={16} />
      </span>

      {children}
    </li>
  )
}
