import { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/App/lib/utils'
import { isSidebarOpenAtom, libraryOrderAtom } from '@/App/atoms'
import { HelpButton } from '@/App/Sidebar/HelpButton'
import { Logo } from '@/App/Sidebar/Logo'
import { libraryItemId, useLibraryItems } from '@/App/lib/library'
import type { LibraryItem } from '@/App/lib/types'
import { LibraryTransferControls } from '@/App/Sidebar/LibraryTransferControls'
import { VideoItem } from '@/App/Sidebar/VideoItem'
import { NewProjectButton } from '@/App/Sidebar/NewProjectButton'
import { ProjectItem } from '@/App/Sidebar/ProjectItem'
import { RecordControls } from '@/App/lib/RecordControls'
import { SortingList } from '@/App/Sidebar/SortingList'
import { StorageUsage } from '@/App/Sidebar/StorageUsage'
import { UploadVideoButton } from '@/App/lib/UploadVideoButton'

const LIBRARY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'project', label: 'Projects' },
  { value: 'video', label: 'Videos' },
] as const

type LibraryFilter = (typeof LIBRARY_FILTERS)[number]['value']

export function Sidebar() {
  const library = useLibraryItems()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(isSidebarOpenAtom)
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all')

  const visibleLibrary = library.filter((item) => libraryFilter === 'all' || item.type === libraryFilter)

  // a filtered drag only reorders what is on screen — keep the hidden items
  // parked in their own slots instead of dropping them out of the order
  function reorderLibrary(nextVisible: LibraryItem[]) {
    const visibleIds = new Set(nextVisible.map(libraryItemId))
    const idsToPlace = nextVisible.map(libraryItemId)
    const nextOrder = library.map((item) => {
      const id = libraryItemId(item)
      if (!visibleIds.has(id)) {
        return id
      }
      const [idToPlace] = idsToPlace.splice(0, 1)
      return idToPlace ?? id
    })
    setLibraryOrder(nextOrder)
  }

  return (
    <>
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-85 max-w-[85vw] shrink-0 flex-col border-r border-slate-700 bg-blue-950 transition-transform md:static md:z-auto md:max-w-none md:translate-x-0 md:transition-none',
          !isSidebarOpen && '-translate-x-full',
        )}
      >
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={isSidebarOpen}
          className="absolute top-[max(0.5rem,env(safe-area-inset-top))] left-full flex size-10 cursor-pointer items-center justify-center rounded-r-full border border-l-0 border-slate-700 bg-slate-900/80 text-slate-300 shadow-lg backdrop-blur active:bg-slate-800 md:hidden"
        >
          <ChevronRight
            size={20}
            className={cn('transition-transform', isSidebarOpen && 'rotate-180')}
          />
        </button>

        <header className="flex flex-col gap-1 border-b border-slate-700 p-2">
          <div className="flex items-center justify-between">
            <Logo />
            <HelpButton />
          </div>

          <div className="-mb-2 flex items-stretch justify-between gap-2">
            <h2 className="flex items-center text-xs font-semibold tracking-wide text-slate-500 uppercase">Library</h2>

            <div className="flex">
              {LIBRARY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setLibraryFilter(filter.value)}
                  aria-pressed={libraryFilter === filter.value}
                  className={cn(
                    'flex min-h-10 flex-1 cursor-pointer items-center justify-center border-b-2 px-2 text-xs',
                    libraryFilter === filter.value
                      ? 'border-slate-200 text-slate-100'
                      : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200 active:text-slate-100',
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-gutter-stable">
          <SortingList
            items={visibleLibrary}
            getId={libraryItemId}
            onReorder={reorderLibrary}
            renderItem={(item) =>
              item.type === 'project' ? <ProjectItem project={item.project} /> : <VideoItem video={item.video} />
            }
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-700 p-2">
          <div className="flex flex-wrap gap-1 justify-stretch">
            <RecordControls />
            <UploadVideoButton />
            <NewProjectButton />
          </div>

          <StorageUsage />

          <details className="group">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1 text-xs text-slate-400 select-none hover:text-slate-200 active:text-slate-100 [&::-webkit-details-marker]:hidden">
              <ChevronRight
                size={14}
                className="transition-transform group-open:rotate-90"
              />
              Transfer library
            </summary>
            <div className="pt-2">
              <LibraryTransferControls />
            </div>
          </details>
        </div>
      </div>
    </>
  )
}
