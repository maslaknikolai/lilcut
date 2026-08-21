import { useSetAtom } from 'jotai'
import { libraryOrderAtom } from './atoms'
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

  return (
    <div className="flex w-85 shrink-0 flex-col border-r border-slate-700">
      <header className="flex flex-col gap-1 border-b border-slate-700 p-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">lilcut</span>
          <HelpButton />
        </div>
        <div className="flex flex-wrap gap-1 items-center">
          <RecordControls />
          <UploadMediaAssetButton />
          <NewProjectButton />
        </div>
      </header>

      <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-gutter-stable">
        <SortingList
          items={library}
          getId={libraryItemId}
          onReorder={(next) => setLibraryOrder(next.map(libraryItemId))}
          renderItem={(item, dragProps) =>
            item.type === 'project' ? (
              <ProjectItem
                project={item.project}
                {...dragProps}
              />
            ) : (
              <MediaAssetItem
                mediaAsset={item.mediaAsset}
                {...dragProps}
              />
            )
          }
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-700 p-2">
        <StorageUsage />
        <LibraryTransferControls />
      </div>
    </div>
  )
}
