import { useSetAtom } from 'jotai'
import { libraryOrderAtom } from './atoms'
import { libraryItemId, useLibraryItems } from './library'
import { MediaAssetItem } from './MediaAssetItem'
import { NewProjectButton } from './NewProjectButton'
import { ProjectItem } from './ProjectItem'
import { RecordControls } from './RecordControls'
import { SortingList } from './SortingList'
import { StorageUsage } from './StorageUsage'
import { UploadMediaAssetButton } from './UploadMediaAssetButton'
import { useSyncSelectedLibraryItem } from './useSyncSelectedLibraryItem'

export function LibrarySidebar() {
  const library = useLibraryItems()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  useSyncSelectedLibraryItem()

  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-neutral-300">
      <div className="flex items-center justify-between border-b border-neutral-300 p-2">
        <div className="flex gap-1 items-center">
          <RecordControls />
          <NewProjectButton />
          <UploadMediaAssetButton />
        </div>
        <StorageUsage />
      </div>

      <div className="flex-1 overflow-y-auto">
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
    </div>
  )
}
