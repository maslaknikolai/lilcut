import { Fragment, type ReactNode } from 'react'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

type SortingListProps<T> = {
  items: T[]
  getId: (item: T) => string
  onReorder: (next: T[]) => void
  renderItem: (item: T) => ReactNode
  className?: string
}

export function SortingList<T>({ items, getId, onReorder, renderItem, className }: SortingListProps<T>) {
  // a small distance threshold keeps plain clicks on the drag handle from
  // starting a drag
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const ids = items.map(getId)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) {
      return
    }
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        <ul className={className}>
          {items.map((item) => (
            <Fragment key={getId(item)}>{renderItem(item)}</Fragment>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
