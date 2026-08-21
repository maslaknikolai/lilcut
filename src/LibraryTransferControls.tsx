import { useRef, useState, type ChangeEvent } from 'react'
import { useAtom } from 'jotai'
import { strFromU8, strToU8, Unzip, UnzipInflate, UnzipPassThrough, Zip, ZipPassThrough } from 'fflate'
import { FolderDown, FolderUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GhostButton } from './GhostButton'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom } from './atoms'
import { createOpfsWritable, deleteOpfsFile, readOpfsFile } from './opfs'
import type { Project } from './types'
import { uniqueName } from './uniqueName'
import { useMediaAssetActions } from './useMediaAssetActions'

type LibraryManifest = {
  version: number
  projects: Project[]
  libraryOrder: string[]
}

const MANIFEST_NAME = 'library.json'

const MANIFEST_VERSION = 1

type RawManifest = Partial<LibraryManifest>

function migrateManifest(raw: RawManifest): LibraryManifest | null {
  const version = raw.version ?? 1
  if (version > MANIFEST_VERSION) {
    return null
  }

  // future upgrades, oldest first:
  // if (version < 2) { ... }

  return {
    version: MANIFEST_VERSION,
    projects: raw.projects ?? [],
    libraryOrder: raw.libraryOrder ?? [],
  }
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return merged
}

export function LibraryTransferControls() {
  const [mediaAssets] = useAtom(mediaAssetsAtom)
  const [projects, setProjects] = useAtom(projectsAtom)
  const [libraryOrder, setLibraryOrder] = useAtom(libraryOrderAtom)
  const { refreshMediaAssets } = useMediaAssetActions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isTransferring, setIsTransferring] = useState(false)

  // streams file by file into the zip and the zip straight to disk, so memory
  // stays bounded by chunk size, not library size
  async function exportLibrary() {
    // 'sv' locale formats as ISO-like "2026-08-20 15:42:11"; colons are
    // invalid in filenames on some systems
    const timestamp = new Date().toLocaleString('sv').replaceAll(':', '-')
    const fileHandle = await window
      .showSaveFilePicker({
        suggestedName: `lilcut-library-${timestamp}.zip`,
        types: [{ description: 'Zip archive', accept: { 'application/zip': ['.zip'] } }],
      })
      // the picker throws on cancel
      .catch(() => null)
    if (!fileHandle) {
      return
    }

    setIsTransferring(true)
    const writable = await fileHandle.createWritable()
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
        writeChain = writeChain.then(() => writable.write(chunk))
        if (isFinal) {
          writeChain.then(finishZip, failZip)
        }
      })

      for (const mediaAsset of mediaAssets) {
        // pass-through entry (no compression): video data is already compressed
        const entry = new ZipPassThrough(`media/${mediaAsset.opfsName}`)
        zip.add(entry)
        const file = await readOpfsFile(mediaAsset.opfsName)
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
      await writable.close()
    } catch (error) {
      await writable.abort()
      throw error
    } finally {
      setIsTransferring(false)
    }
  }

  // streams zip entries into OPFS as they decompress — same bounded memory
  async function importLibrary(zipFile: File) {
    setIsTransferring(true)
    try {
      const opfsNameByImportedName = new Map<string, string>()
      const knownOpfsNames = mediaAssets.map((mediaAsset) => mediaAsset.opfsName)
      const manifestChunks: Uint8Array[] = []
      let streamError: Error | null = null
      let entryWriteChain: Promise<unknown> = Promise.resolve()

      const unzipper = new Unzip()
      unzipper.register(UnzipPassThrough)
      // foreign tools may have re-zipped the library with compression on
      unzipper.register(UnzipInflate)

      unzipper.onfile = (entryFile) => {
        if (entryFile.name === MANIFEST_NAME) {
          entryFile.ondata = (error, chunk) => {
            if (error) {
              streamError = error
              return
            }
            manifestChunks.push(chunk)
          }
          entryFile.start()
          return
        }

        const importedName = entryFile.name.startsWith('media/') ? entryFile.name.slice('media/'.length) : ''
        if (!importedName) {
          return
        }

        const opfsName = uniqueName(importedName, knownOpfsNames)
        knownOpfsNames.push(opfsName)
        opfsNameByImportedName.set(importedName, opfsName)

        const opfsWritablePromise = createOpfsWritable(opfsName)
        entryFile.ondata = (error, chunk, isFinal) => {
          if (error) {
            streamError = error
            return
          }
          entryWriteChain = entryWriteChain.then(async () => {
            const entryWritable = await opfsWritablePromise
            await entryWritable.write(chunk)
            if (isFinal) {
              await entryWritable.close()
            }
          })
        }
        entryFile.start()
      }

      const reader = zipFile.stream().getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          unzipper.push(new Uint8Array(0), true)
          break
        }
        unzipper.push(value)
      }
      await entryWriteChain
      if (streamError) {
        throw streamError
      }
      await refreshMediaAssets()

      if (manifestChunks.length === 0) {
        return
      }
      const manifest = migrateManifest(JSON.parse(strFromU8(concatChunks(manifestChunks))) as RawManifest)
      if (!manifest) {
        alert('This library file was exported by a newer version of lilcut — update the app to import it.')
        return
      }

      // projects: fresh ids, deduped names, clips remapped to the new file names
      const projectIdByImportedId = new Map<string, string>()
      const knownProjectNames = projects.map((project) => project.name)
      const importedProjects = manifest.projects.map((importedProject) => {
        const id = crypto.randomUUID()
        projectIdByImportedId.set(importedProject.id, id)
        const name = uniqueName(importedProject.name, knownProjectNames)
        knownProjectNames.push(name)
        const clips = importedProject.clips.map((clip) => ({
          ...clip,
          id: crypto.randomUUID(),
          mediaAssetOpfsName: opfsNameByImportedName.get(clip.mediaAssetOpfsName) ?? clip.mediaAssetOpfsName,
        }))
        return { id, name, clips }
      })
      setProjects((prev) => [...importedProjects, ...prev])

      // keep the imported ordering on top, dropping entries whose file or
      // project didn't make it into the zip
      const importedOrder = manifest.libraryOrder.flatMap((importedId) => {
        const mappedId = projectIdByImportedId.get(importedId) ?? opfsNameByImportedName.get(importedId)
        return mappedId ? [mappedId] : []
      })
      setLibraryOrder((prev) => [...importedOrder, ...prev])
    } finally {
      setIsTransferring(false)
    }
  }

  async function clearLibrary() {
    if (!confirm('Delete all projects and video files? This cannot be undone.')) {
      return
    }
    setIsTransferring(true)
    try {
      for (const mediaAsset of mediaAssets) {
        await deleteOpfsFile(mediaAsset.opfsName)
      }
      setProjects([])
      setLibraryOrder([])
      await refreshMediaAssets()
    } finally {
      setIsTransferring(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const zipFile = event.target.files?.[0]
    event.target.value = ''
    if (zipFile) {
      importLibrary(zipFile)
    }
  }

  const isLibraryEmpty = mediaAssets.length + projects.length === 0
  const controlClassName = 'flex-1 text-slate-400 hover:text-slate-200'

  return (
    <div className="flex gap-1">
      <GhostButton
        onClick={exportLibrary}
        disabled={isTransferring || isLibraryEmpty}
        className={controlClassName}
      >
        <FolderDown size={14} />
        Export
      </GhostButton>

      <GhostButton
        onClick={() => fileInputRef.current?.click()}
        disabled={isTransferring}
        className={controlClassName}
      >
        <FolderUp size={14} />
        Import
      </GhostButton>

      <GhostButton
        onClick={clearLibrary}
        disabled={isTransferring || isLibraryEmpty}
        className={cn(controlClassName, 'text-red-400 hover:text-red-300')}
      >
        <Trash2 size={14} />
        Clear
      </GhostButton>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
