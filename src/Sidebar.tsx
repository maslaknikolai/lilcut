import { useAtom, useSetAtom } from 'jotai'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSidebarOpenAtom, libraryOrderAtom } from './atoms'
import { HelpButton } from './HelpButton'
import { libraryItemId, useLibraryItems } from './library'
import { LibraryTransferControls } from './LibraryTransferControls'
import { MediaAssetItem } from './MediaAssetItem'
import { NewProjectButton } from './NewProjectButton'
import { ProjectItem } from './ProjectItem'
import { RecordControls } from './RecordControls'
import { SortingList } from './SortingList'
import { StorageUsage } from './StorageUsage'
import { UploadMediaAssetButton } from './UploadMediaAssetButton'

export function Sidebar() {
  const library = useLibraryItems()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(isSidebarOpenAtom)

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
        <header className="flex flex-col gap-1 border-b border-slate-700 p-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold tracking-tight">lilcut</span>
            <HelpButton />
          </div>
          <h2 className="pt-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">Library</h2>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-gutter-stable">
          <SortingList
            items={library}
            getId={libraryItemId}
            onReorder={(next) => setLibraryOrder(next.map(libraryItemId))}
            renderItem={(item) =>
              item.type === 'project' ? (
                <ProjectItem project={item.project} />
              ) : (
                <MediaAssetItem mediaAsset={item.mediaAsset} />
              )
            }
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-700 p-2">
          <div className="flex flex-wrap gap-1 items-center">
            <RecordControls />
            <UploadMediaAssetButton />
            <NewProjectButton />
          </div>

          <StorageUsage />

          <details className="group">
            <summary className="touch-target flex cursor-pointer list-none items-center gap-1 text-xs text-slate-400 select-none hover:text-slate-200 active:text-slate-100 [&::-webkit-details-marker]:hidden">
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
