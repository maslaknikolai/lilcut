import { useRef, type ChangeEvent } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Upload } from 'lucide-react'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { uniqueOpfsName, writeOpfsFile } from './opfs'
import { ActionButton } from './ActionButton'

export function UploadMediaFileButton() {
  const [mediaFiles, setMediaFiles] = useAtom(mediaFilesAtom)
  const setSelectedMediaFileId = useSetAtom(selectedMediaFileIdAtom)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    const id = crypto.randomUUID()
    const opfsName = uniqueOpfsName(file.name, mediaFiles)
    await writeOpfsFile(opfsName, file)

    setMediaFiles((prev) => [{ id, createdAt: Date.now(), opfsName, mimeType: file.type }, ...prev])
    setSelectedMediaFileId(id)
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
