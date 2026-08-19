import { Fragment, useState, type ReactNode } from 'react'
import { reorderById } from './reorderById'

type SortingListProps<T> = {
  items: T[]
  getId: (item: T) => string
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

export function SortingList<T>({ items, getId, onReorder, renderItem }: SortingListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  function moveDraggedItem(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return
    }
    onReorder(reorderById(items, getId, draggedId, targetId))
  }

  return (
    <ul>
      {items.map((item) => {
        const id = getId(item)
        return (
          <Fragment key={id}>
            {renderItem(item, {
              isDragging: id === draggedId,
              onDragStart: () => setDraggedId(id),
              onDragOver: () => moveDraggedItem(id),
              onDrop: () => setDraggedId(null),
              onDragEnd: () => setDraggedId(null),
            })}
          </Fragment>
        )
      })}
    </ul>
  )
}
