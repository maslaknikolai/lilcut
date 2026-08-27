import type { ReactNode } from 'react'
import { useSetAtom } from 'jotai'
import { cn } from '@/App/lib/utils'
import { isSidebarOpenAtom } from '@/App/atoms'
import { SortingItem } from '@/App/Sidebar/SortingItem'
import { useScrollCurrentIntoView } from '@/App/lib/useScrollCurrentIntoView'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

type LibraryItemProps = {
  id: string
  name: string
  icon: ReactNode
  actions?: ReactNode
}

export function LibraryItem({ id, name, icon, actions }: LibraryItemProps) {
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const setIsSidebarOpen = useSetAtom(isSidebarOpenAtom)
  const isSelected = id === selectedLibraryItemId
  const rootRef = useScrollCurrentIntoView<HTMLLIElement>(isSelected)

  return (
    <SortingItem
      ref={rootRef}
      id={id}
      onClick={() => {
        setSelectedLibraryItemId(id)
        setIsSidebarOpen(false)
      }}
      className={cn(
        'cursor-pointer gap-1.5 py-1 active:bg-blue-800/60',
        isSelected ? 'bg-blue-800/40' : 'hover:bg-blue-900/40',
      )}
      dragHandleLabel={`Reorder ${name}`}
    >
      {icon}

      <span className="min-w-0 flex-1 truncate py-2 text-xs text-slate-100">{name}</span>

      <div className="items-stretch gap-1 self-stretch flex">{actions}</div>
    </SortingItem>
  )
}
