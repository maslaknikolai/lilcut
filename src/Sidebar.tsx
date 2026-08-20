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

export function Sidebar() {
  const library = useLibraryItems()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-slate-700">
      <header className="flex flex-col gap-2 border-b border-slate-700 p-2">
        <span className="text-lg font-bold tracking-tight">lilcut</span>
        <span className="text-sm font-medium text-slate-400">Library</span>
        <div className="flex gap-1 items-center">
          <RecordControls isWithLabel />
          <NewProjectButton isWithLabel />
          <UploadMediaAssetButton isWithLabel />
        </div>
      </header>

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

      <div className="border-t border-slate-700 p-2">
        <StorageUsage />
      </div>
    </div>
  )
}
