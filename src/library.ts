import { useAtomValue } from 'jotai'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom } from './atoms'
import type { LibraryItem, MediaAsset, Project } from './types'

export function libraryItemId(item: LibraryItem): string {
  return item.type === 'project' ? item.project.id : item.mediaAsset.opfsName
}

export function orderLibraryItems(projects: Project[], mediaAssets: MediaAsset[], order: string[]): LibraryItem[] {
  const itemsById = new Map<string, LibraryItem>()
  for (const project of projects) {
    itemsById.set(project.id, { type: 'project', project })
  }
  for (const mediaAsset of mediaAssets) {
    itemsById.set(mediaAsset.opfsName, { type: 'media', mediaAsset })
  }
  const ordered = order.flatMap((id) => {
    const item = itemsById.get(id)
    if (!item) {
      return []
    }
    itemsById.delete(id)
    return [item]
  })
  return [...ordered, ...itemsById.values()]
}

export function useLibraryItems(): LibraryItem[] {
  const projects = useAtomValue(projectsAtom)
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const libraryOrder = useAtomValue(libraryOrderAtom)
  return orderLibraryItems(projects, mediaAssets, libraryOrder)
}

export function updateProject(
  projects: Project[],
  projectId: string,
  updater: (project: Project) => Project,
): Project[] {
  return projects.map((project) => (project.id === projectId ? updater(project) : project))
}
