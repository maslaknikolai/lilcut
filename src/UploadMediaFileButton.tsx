import { useRef, type ChangeEvent } from 'react'
import { useSetAtom } from 'jotai'
import { Upload } from 'lucide-react'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { writeOpfsFile } from './opfs'
import { SidebarActionButton } from './SidebarActionButton'

export function UploadMediaFileButton() {
  const setMediaFiles = useSetAtom(mediaFilesAtom)
  const setSelectedMediaFileId = useSetAtom(selectedMediaFileIdAtom)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    const id = crypto.randomUUID()
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
    const opfsName = `${id}.${extension}`
    await writeOpfsFile(opfsName, file)

    setMediaFiles((prev) => [{ id, name: file.name, createdAt: Date.now(), opfsName, mimeType: file.type }, ...prev])
    setSelectedMediaFileId(id)
  }

  return (
    <>
      <SidebarActionButton
        onClick={() => inputRef.current?.click()}
        className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
      >
        <Upload size={14} />
      </SidebarActionButton>

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
