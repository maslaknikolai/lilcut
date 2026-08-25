import { useRef, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { GhostButton } from '@/App/lib/GhostButton'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'
import { useUploadVideos } from '@/App/lib/useUploadVideos'

type UploadVideoButtonProps = {
  className?: string
  // overrides the default "select the first uploaded video" behavior
  onUploaded?: (opfsNames: string[]) => void
}

export function UploadVideoButton({ className, onUploaded }: UploadVideoButtonProps) {
  const uploadVideos = useUploadVideos()
  const [, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (files.length === 0) {
      return
    }

    const uploadedOpfsNames = await uploadVideos(files)
    if (onUploaded) {
      onUploaded(uploadedOpfsNames)
      return
    }
    setSelectedLibraryItemId(uploadedOpfsNames[0])
  }

  return (
    <>
      <GhostButton
        onClick={() => inputRef.current?.click()}
        className={className}
      >
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
