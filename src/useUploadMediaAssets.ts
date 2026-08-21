import { useAtomValue, useSetAtom } from 'jotai'
import { libraryOrderAtom, mediaAssetsAtom } from './atoms'
import { uniqueName } from './uniqueName'
import { useMediaAssetActions } from './useMediaAssetActions'

// writes the files into OPFS under collision-free names and puts them at the
// top of the library; returns the new opfs names in file order
export function useUploadMediaAssets() {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

  return async function uploadMediaAssets(files: File[]): Promise<string[]> {
    const knownOpfsNames = mediaAssets.map((mediaAsset) => mediaAsset.opfsName)
    const uploadedOpfsNames: string[] = []
    for (const file of files) {
      const opfsName = uniqueName(file.name, knownOpfsNames)
      knownOpfsNames.push(opfsName)
      await writeMediaAsset(opfsName, file)
      uploadedOpfsNames.push(opfsName)
    }
    setLibraryOrder((prev) => [...uploadedOpfsNames, ...prev])
    return uploadedOpfsNames
  }
}
