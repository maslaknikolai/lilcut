import { useAtomValue, useSetAtom } from 'jotai'
import { libraryOrderAtom, videosAtom } from '@/App/atoms'
import { uniqueName } from '@/App/lib/uniqueName'
import { useVideoActions } from '@/App/lib/useVideoActions'

// writes the files into OPFS under collision-free names and puts them at the
// top of the library; returns the new opfs names in file order
export function useUploadVideos() {
  const videos = useAtomValue(videosAtom)
  const { writeVideo } = useVideoActions()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

  return async function uploadVideos(files: File[]): Promise<string[]> {
    const knownOpfsNames = videos.map((video) => video.opfsName)
    const uploadedOpfsNames: string[] = []
    for (const file of files) {
      const opfsName = uniqueName(file.name, knownOpfsNames)
      knownOpfsNames.push(opfsName)
      await writeVideo(opfsName, file)
      uploadedOpfsNames.push(opfsName)
    }
    setLibraryOrder((prev) => [...uploadedOpfsNames, ...prev])
    return uploadedOpfsNames
  }
}
