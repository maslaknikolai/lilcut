import { useRef, type ChangeEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Upload } from 'lucide-react'
import { libraryOrderAtom, mediaAssetsAtom, selectedLibraryItemIdAtom } from './atoms'
import { uniqueOpfsName } from './opfs'
import { ActionButton } from './ActionButton'
import { useMediaAssetActions } from './useMediaAssetActions'

export function UploadMediaAssetButton() {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const setSelectedLibraryItemId = useSetAtom(selectedLibraryItemIdAtom)
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
      <ActionButton
        onClick={() => inputRef.current?.click()}
        className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
      >
        <Upload size={14} />
      </ActionButton>

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
