import { useNavigate, useParams } from 'react-router-dom'

export function useSelectedLibraryItemId() {
  const { selectedId } = useParams<{ selectedId?: string }>()
  const navigate = useNavigate()

  const selectedLibraryItemId = selectedId ? decodeURIComponent(selectedId) : null

  function setSelectedLibraryItemId(id: string | null) {
    navigate(id ? `/${encodeURIComponent(id)}` : '/')
  }

  return [selectedLibraryItemId, setSelectedLibraryItemId] as const
}
