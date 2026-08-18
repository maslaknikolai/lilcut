export function reorderById<T extends { id: string }>(
  items: T[],
  draggedId: string,
  targetId: string,
): T[] {
  const dragIndex = items.findIndex((item) => item.id === draggedId)
  const targetIndex = items.findIndex((item) => item.id === targetId)
  const next = [...items]
  const [draggedItem] = next.splice(dragIndex, 1)
  next.splice(targetIndex, 0, draggedItem)
  return next
}
