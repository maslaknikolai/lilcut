import { useRef, type ChangeEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Upload } from 'lucide-react'
import { libraryOrderAtom, mediaAssetsAtom } from './atoms'
import { uniqueOpfsName } from './opfs'
import { ActionButton } from './ActionButton'
import { useMediaAssetActions } from './useMediaAssetActions'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'

type UploadMediaAssetButtonProps = {
  isWithLabel?: boolean
}

export function UploadMediaAssetButton({ isWithLabel }: UploadMediaAssetButtonProps) {
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
      <ActionButton
        onClick={() => inputRef.current?.click()}
        className="border-neutral-700 text-neutral-300 hover:bg-neutral-900"
      >
        <Upload size={14} />
        {isWithLabel && <span>Upload</span>}
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
