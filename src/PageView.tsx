import { libraryItemId, useLibraryItems } from './library'
import { MediaAssetPage } from './MediaAssetPage'
import { ProjectPage } from './ProjectPage'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

export function PageView() {
  const library = useLibraryItems()
  const [selectedLibraryItemId] = useSelectedLibraryItemId()
  const selectedLibraryItem = library.find((item) => libraryItemId(item) === selectedLibraryItemId)

  if (selectedLibraryItem?.type === 'project') {
    return (
      <div
        key={selectedLibraryItem.project.id}
        className="flex flex-1 flex-col p-4"
      >
        <ProjectPage project={selectedLibraryItem.project} />
      </div>
    )
  }

  if (selectedLibraryItem?.type === 'media') {
    return (
      <MediaAssetPage
        key={selectedLibraryItem.mediaAsset.opfsName}
        mediaAsset={selectedLibraryItem.mediaAsset}
      />
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center text-center text-slate-400">
      {library.length === 0 ? 'Record or add your first file' : 'Select a project or file'}
    </div>
  )
}
