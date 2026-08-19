export function reorderById<T>(items: T[], getId: (item: T) => string, draggedId: string, targetId: string): T[] {
  const dragIndex = items.findIndex((item) => getId(item) === draggedId)
  const targetIndex = items.findIndex((item) => getId(item) === targetId)
  const next = [...items]
  const [draggedItem] = next.splice(dragIndex, 1)
  next.splice(targetIndex, 0, draggedItem)
  return next
}
