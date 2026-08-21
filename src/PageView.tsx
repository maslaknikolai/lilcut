import { libraryItemId, useLibraryItems } from './library'
import { MediaAssetPage } from './MediaAssetPage'
import { ProjectPage } from './ProjectPage'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

export function PageView() {
  const library = useLibraryItems()
  const [selectedLibraryItemId] = useSelectedLibraryItemId()
  const selectedLibraryItem = library.find((item) => libraryItemId(item) === selectedLibraryItemId)

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden bg-slate-950">
      {selectedLibraryItem?.type === 'project' ? (
        <ProjectPage
          key={selectedLibraryItem.project.id}
          project={selectedLibraryItem.project}
        />
      ) : selectedLibraryItem?.type === 'media' ? (
        <MediaAssetPage
          key={selectedLibraryItem.mediaAsset.opfsName}
          mediaAsset={selectedLibraryItem.mediaAsset}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-center text-slate-400">
          {library.length === 0
            ? 'Record or add your first file'
            : selectedLibraryItemId
              ? 'Item not found'
              : 'Select a project or file'}
        </div>
      )}
    </div>
  )
}
