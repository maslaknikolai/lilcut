import type { ReactNode } from 'react'
import { useSetAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { isSidebarOpenAtom } from './atoms'
import { SortingItem } from './SortingItem'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

type LibraryItemProps = {
  id: string
  name: string
  icon: ReactNode
  isDragging: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDrop: () => void
  onDragEnd: () => void
  actions?: ReactNode
}

export function LibraryItem({
  id,
  name,
  icon,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  actions,
}: LibraryItemProps) {
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const setIsSidebarOpen = useSetAtom(isSidebarOpenAtom)
  const isSelected = id === selectedLibraryItemId

  return (
    <SortingItem
      isDragging={isDragging}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={() => {
        setSelectedLibraryItemId(id)
        setIsSidebarOpen(false)
      }}
      className={cn('cursor-pointer gap-1.5 py-1', isSelected ? 'bg-blue-800/40' : 'hover:bg-blue-900/40')}
      dragHandleLabel={`Reorder ${name}`}
    >
      {icon}

      <span className="min-w-0 flex-1 truncate py-2 text-xs text-slate-100">{name}</span>

      <div className="flex items-stretch gap-1 self-stretch">{actions}</div>
    </SortingItem>
  )
}
