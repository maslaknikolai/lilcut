import { libraryItemId, useLibraryItems } from '@/App/lib/library'
import { VideoPage } from '@/App/pages/VideoPage/VideoPage'
import { ProjectPage } from '@/App/pages/ProjectPage/ProjectPage'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'
import { LibraryItemType } from '../lib/types'

export function PageView() {
  const library = useLibraryItems()
  const [selectedLibraryItemId] = useSelectedLibraryItemId()
  const selectedLibraryItem = library.find((item) => libraryItemId(item) === selectedLibraryItemId)

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden bg-slate-950">
      {selectedLibraryItem?.type === LibraryItemType.Project ? (
        <ProjectPage
          key={selectedLibraryItem.project.id}
          project={selectedLibraryItem.project}
        />
      ) : selectedLibraryItem?.type === LibraryItemType.Video ? (
        <VideoPage
          key={selectedLibraryItem.video.opfsName}
          video={selectedLibraryItem.video}
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
