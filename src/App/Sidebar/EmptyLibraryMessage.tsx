import { LibraryItemType, type LibraryFilter } from '@/App/lib/types'

type EmptyLibraryMessageProps = {
  isLibraryEmpty: boolean
  libraryFilter: LibraryFilter
}

function getMessage(isLibraryEmpty: boolean, libraryFilter: LibraryFilter): string {
  if (isLibraryEmpty) {
    return 'Your library is empty — record a video, upload one, or start a project'
  }
  if (libraryFilter === LibraryItemType.Project) {
    return 'No projects yet — create one with New project'
  }
  if (libraryFilter === LibraryItemType.Video) {
    return 'No videos yet — record or upload one'
  }
  return 'Nothing to show'
}

export function EmptyLibraryMessage({ isLibraryEmpty, libraryFilter }: EmptyLibraryMessageProps) {
  return <p className="p-4 text-center text-sm text-slate-500">{getMessage(isLibraryEmpty, libraryFilter)}</p>
}
