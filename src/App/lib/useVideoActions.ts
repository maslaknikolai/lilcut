import { useSetAtom } from 'jotai'
import { libraryOrderAtom, videosAtom } from '@/App/atoms'
import { deleteOpfsFile, listOpfsVideos, renameOpfsFile, writeOpfsFile } from '@/App/lib/opfs'

// wraps the OPFS video mutations so every call site gets the
// videosAtom refresh for free, instead of remembering to trigger it
export function useVideoActions() {
  const setVideos = useSetAtom(videosAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

  async function refreshVideos() {
    setVideos(await listOpfsVideos())
  }

  async function writeVideo(name: string, blob: Blob): Promise<void> {
    await writeOpfsFile(name, blob)
    await refreshVideos()
  }

  async function deleteVideo(name: string): Promise<void> {
    await deleteOpfsFile(name)
    await refreshVideos()
    setLibraryOrder((prev) => prev.filter((id) => id !== name))
  }

  async function renameVideo(oldName: string, newName: string): Promise<void> {
    await renameOpfsFile(oldName, newName)
    await refreshVideos()
  }

  return { writeVideo, deleteVideo, renameVideo, refreshVideos }
}
