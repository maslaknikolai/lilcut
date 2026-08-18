import { Fragment, useState, type ReactNode } from 'react'
import { reorderById } from './reorderById'

type SortingListProps<T extends { id: string }> = {
  items: T[]
  onReorder: (next: T[]) => void
  renderItem: (
    item: T,
    dragProps: {
      isDragging: boolean
      onDragStart: () => void
      onDragOver: () => void
      onDrop: () => void
      onDragEnd: () => void
    },
  ) => ReactNode
}

export function SortingList<T extends { id: string }>({ items, onReorder, renderItem }: SortingListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  function moveDraggedItem(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return
    }
    onReorder(reorderById(items, draggedId, targetId))
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {items.map((item) => (
        <Fragment key={item.id}>
          {renderItem(item, {
            isDragging: item.id === draggedId,
            onDragStart: () => setDraggedId(item.id),
            onDragOver: () => moveDraggedItem(item.id),
            onDrop: () => setDraggedId(null),
            onDragEnd: () => setDraggedId(null),
          })}
        </Fragment>
      ))}
    </ul>
  )
}
