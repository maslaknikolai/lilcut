import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { strToU8, Zip, ZipPassThrough } from 'fflate'
import { libraryOrderAtom, videosAtom, projectsAtom } from '@/App/atoms'
import { MANIFEST_NAME, MANIFEST_VERSION, type LibraryManifest } from '@/App/Sidebar/libraryManifest'
import { readOpfsFile } from '@/App/lib/opfs'

// streams file by file into the zip and the zip straight to disk, so memory
// stays bounded by chunk size, not library size
export function useExportLibrary() {
  const videos = useAtomValue(videosAtom)
  const projects = useAtomValue(projectsAtom)
  const libraryOrder = useAtomValue(libraryOrderAtom)
  const [isExporting, setIsExporting] = useState(false)

  async function exportLibrary() {
    // 'sv' locale formats as ISO-like "2026-08-20 15:42:11"; colons are
    // invalid in filenames on some systems
    const timestamp = new Date().toLocaleString('sv').replaceAll(':', '-')
    const suggestedName = `LilCut-library-${timestamp}.zip`

    const isPickerSupported = 'showSaveFilePicker' in window
    const fileHandle = isPickerSupported
      ? await window
          .showSaveFilePicker({
            suggestedName,
            types: [{ description: 'Zip archive', accept: { 'application/zip': ['.zip'] } }],
          })
          // the picker throws on cancel
          .catch(() => null)
      : null
    if (isPickerSupported && !fileHandle) {
      return
    }

    setIsExporting(true)
    const writable = fileHandle ? await fileHandle.createWritable() : null
    // without the picker (mobile, Safari, Firefox) the zip is
    // buffered in memory and saved via a download link — fine until a library
    // outgrows RAM; a service-worker streaming download if that ever happens
    const bufferedChunks: BlobPart[] = []
    try {
      let finishZip!: () => void
      let failZip!: (error: Error) => void
      const zipDone = new Promise<void>((resolve, reject) => {
        finishZip = resolve
        failZip = reject
      })

      let writeChain = Promise.resolve()
      const zip = new Zip((error, chunk, isFinal) => {
        if (error) {
          failZip(error)
          return
        }
        if (writable) {
          writeChain = writeChain.then(() => writable.write(chunk))
          if (isFinal) {
            writeChain.then(finishZip, failZip)
          }
        } else {
          bufferedChunks.push(chunk)
          if (isFinal) {
            finishZip()
          }
        }
      })

      for (const video of videos) {
        // pass-through entry (no compression): video data is already compressed
        const entry = new ZipPassThrough(`media/${video.opfsName}`)
        zip.add(entry)
        const file = await readOpfsFile(video.opfsName)
        const reader = file.stream().getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          entry.push(value)
        }
        entry.push(new Uint8Array(0), true)
      }

      const manifest: LibraryManifest = { version: MANIFEST_VERSION, projects, libraryOrder }
      const manifestEntry = new ZipPassThrough(MANIFEST_NAME)
      zip.add(manifestEntry)
      manifestEntry.push(strToU8(JSON.stringify(manifest, null, 2)), true)

      zip.end()
      await zipDone
      if (writable) {
        await writable.close()
      } else {
        const blob = new Blob(bufferedChunks, { type: 'application/zip' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = suggestedName
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      await writable?.abort()
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  return { exportLibrary, isExporting }
}
