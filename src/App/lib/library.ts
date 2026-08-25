import { useAtomValue } from 'jotai'
import { libraryOrderAtom, videosAtom, projectsAtom } from '@/App/atoms'
import type { Clip, LibraryItem, Video, Project } from '@/App/lib/types'

export function libraryItemId(item: LibraryItem): string {
  return item.type === 'project' ? item.project.id : item.video.opfsName
}

export function orderLibraryItems(projects: Project[], videos: Video[], order: string[]): LibraryItem[] {
  const itemsById = new Map<string, LibraryItem>()
  for (const project of projects) {
    itemsById.set(project.id, { type: 'project', project })
  }
  for (const video of videos) {
    itemsById.set(video.opfsName, { type: 'video', video })
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
  const videos = useAtomValue(videosAtom)
  const libraryOrder = useAtomValue(libraryOrderAtom)
  return orderLibraryItems(projects, videos, libraryOrder)
}

export function updateProject(
  projects: Project[],
  projectId: string,
  updater: (project: Project) => Project,
): Project[] {
  return projects.map((project) => (project.id === projectId ? updater(project) : project))
}

// clips saved before the MediaAsset→Video rename point at `mediaAssetOpfsName`
type LegacyClip = Clip & { mediaAssetOpfsName?: string }

export function migrateProjects(projects: Project[]): Project[] {
  return projects.map((project) => ({
    ...project,
    clips: project.clips.map((clip: LegacyClip) => {
      if (!clip.mediaAssetOpfsName) {
        return clip
      }
      const { mediaAssetOpfsName, ...rest } = clip
      return { ...rest, videoOpfsName: mediaAssetOpfsName }
    }),
  }))
}
