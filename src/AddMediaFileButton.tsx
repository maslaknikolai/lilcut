import { useRef, type ChangeEvent } from 'react'
import { useSetAtom } from 'jotai'
import { Plus } from 'lucide-react'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { writeOpfsFile } from './opfs'

export function AddMediaFileButton() {
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

    setMediaFiles((prev) => [
      { id, name: file.name, createdAt: Date.now(), opfsName, mimeType: file.type },
      ...prev,
    ])
    setSelectedMediaFileId(id)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex flex-1 items-center justify-center gap-1.5 rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
      >
        <Plus size={14} /> Add
      </button>

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
