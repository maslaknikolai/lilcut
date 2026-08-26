import { useSetAtom } from 'jotai'
import { useNavigate, useParams } from 'react-router-dom'
import { isSidebarOpenAtom } from '@/App/atoms'

export function useSelectedLibraryItemId() {
  const { selectedId } = useParams<{ selectedId?: string }>()
  const navigate = useNavigate()
  const setIsSidebarOpen = useSetAtom(isSidebarOpenAtom)

  const selectedLibraryItemId = selectedId ? decodeURIComponent(selectedId) : null

  function setSelectedLibraryItemId(id: string | null) {
    navigate(id ? `/${encodeURIComponent(id)}` : '/')
    setIsSidebarOpen(true)
  }

  return [selectedLibraryItemId, setSelectedLibraryItemId] as const
}
