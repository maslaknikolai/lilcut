import { useRef, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { GhostButton } from './GhostButton'
import { useSelectedLibraryItemId } from './useSelectedLibraryItemId'
import { useUploadMediaAssets } from './useUploadMediaAssets'

export function UploadMediaAssetButton() {
  const uploadMediaAssets = useUploadMediaAssets()
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (files.length === 0) {
      return
    }

    const uploadedOpfsNames = await uploadMediaAssets(files)
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
