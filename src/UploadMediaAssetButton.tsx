import { useRef, type ChangeEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Upload } from 'lucide-react'
import { libraryOrderAtom, mediaAssetsAtom } from './atoms'
import { GhostButton } from './GhostButton'
import { uniqueName } from './uniqueName'
import { useMediaAssetActions } from './useMediaAssetActions'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

export function UploadMediaAssetButton() {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (files.length === 0) {
      return
    }

    const knownOpfsNames = mediaAssets.map((mediaAsset) => mediaAsset.opfsName)
    const uploadedOpfsNames: string[] = []
    for (const file of files) {
      const opfsName = uniqueName(file.name, knownOpfsNames)
      knownOpfsNames.push(opfsName)
      await writeMediaAsset(opfsName, file)
      uploadedOpfsNames.push(opfsName)
    }

    setLibraryOrder((prev) => [...uploadedOpfsNames, ...prev])
    setSelectedLibraryItemId(uploadedOpfsNames[0])
  }

  return (
    <>
      <GhostButton onClick={() => inputRef.current?.click()}>
        <Upload
          size={14}
          className="text-violet-400"
        />
        <span>Import video</span>
      </GhostButton>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
