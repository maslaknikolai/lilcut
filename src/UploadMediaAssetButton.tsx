import { useRef, type ChangeEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Upload } from 'lucide-react'
import { libraryOrderAtom, mediaAssetsAtom } from './atoms'
import { uniqueOpfsName } from './opfs'
import { GhostButton } from './GhostButton'
import { useMediaAssetActions } from './useMediaAssetActions'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

export function UploadMediaAssetButton() {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    const opfsName = uniqueOpfsName(file.name, mediaAssets)
    await writeMediaAsset(opfsName, file)

    setLibraryOrder((prev) => [opfsName, ...prev])
    setSelectedLibraryItemId(opfsName)
  }

  return (
    <>
      <GhostButton onClick={() => inputRef.current?.click()}>
        <Upload
          size={14}
          className="text-violet-400"
        />
        <span>Upload video</span>
      </GhostButton>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
