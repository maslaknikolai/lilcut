import { useSetAtom, useStore } from 'jotai'
import { useNavigate, useParams } from 'react-router-dom'
import { isSidebarOpenAtom, libraryFilterAtom, projectsAtom } from '@/App/atoms'
import { LibraryItemType } from '@/App/lib/types'

export function useSelectedLibraryItemId() {
  const { selectedId } = useParams<{ selectedId?: string }>()
  const navigate = useNavigate()
  const setIsSidebarOpen = useSetAtom(isSidebarOpenAtom)
  const store = useStore()

  const selectedLibraryItemId = selectedId ? decodeURIComponent(selectedId) : null

  function setSelectedLibraryItemId(id: string | null) {
    navigate(id ? `/${encodeURIComponent(id)}` : '/')
    setIsSidebarOpen(true)

    if (id && store.get(libraryFilterAtom) !== 'all') {
      const isProject = store.get(projectsAtom).some((project) => project.id === id)
      store.set(libraryFilterAtom, isProject ? LibraryItemType.Project : LibraryItemType.Video)
    }
  }

  return [selectedLibraryItemId, setSelectedLibraryItemId] as const
}
