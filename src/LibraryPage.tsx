import { useAtomValue } from 'jotai'
import { selectedLibraryItemIdAtom } from './atoms'
import { libraryItemId, useLibraryItems } from './library'
import { Player } from './Player'
import { ProjectPreview } from './ProjectPreview'

export function LibraryPage() {
  const library = useLibraryItems()
  const selectedLibraryItemId = useAtomValue(selectedLibraryItemIdAtom)
  const selectedLibraryItem = library.find((item) => libraryItemId(item) === selectedLibraryItemId)

  if (selectedLibraryItem?.type === 'project') {
    return (
      <div
        key={selectedLibraryItem.project.id}
        className="flex flex-1 flex-col p-4"
      >
        <ProjectPreview project={selectedLibraryItem.project} />
      </div>
    )
  }

  if (selectedLibraryItem?.type === 'media') {
    return (
      <Player
        key={selectedLibraryItem.mediaAsset.opfsName}
        mediaAsset={selectedLibraryItem.mediaAsset}
      />
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center text-center text-neutral-600">
      {library.length === 0 ? 'Record or add your first file' : 'Select a project or file'}
    </div>
  )
}
