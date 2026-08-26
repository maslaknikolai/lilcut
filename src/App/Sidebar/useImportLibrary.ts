import { useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { strFromU8, Unzip, UnzipInflate, UnzipPassThrough } from 'fflate'
import { libraryOrderAtom, videosAtom, projectsAtom } from '@/App/atoms'
import { MANIFEST_NAME, migrateManifest, type RawManifest } from '@/App/Sidebar/libraryManifest'
import { createOpfsWritable } from '@/App/lib/opfs'
import { uniqueName } from '@/App/lib/uniqueName'
import { useVideoActions } from '@/App/lib/useVideoActions'

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

// streams zip entries into OPFS as they decompress — same bounded memory
export function useImportLibrary() {
  const videos = useAtomValue(videosAtom)
  const [projects, setProjects] = useAtom(projectsAtom)
  const [, setLibraryOrder] = useAtom(libraryOrderAtom)
  const { refreshVideos } = useVideoActions()
  const [isImporting, setIsImporting] = useState(false)

  async function importLibrary(zipFile: File) {
    setIsImporting(true)
    try {
      const opfsNameByImportedName = new Map<string, string>()
      const knownOpfsNames = videos.map((video) => video.opfsName)
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
      await refreshVideos()

      if (!manifestChunks.length) {
        return
      }
      const manifest = migrateManifest(JSON.parse(strFromU8(concatChunks(manifestChunks))) as RawManifest)
      if (!manifest) {
        alert('This library file was exported by a newer version of LilCut — update the app to import it.')
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
          videoOpfsName: opfsNameByImportedName.get(clip.videoOpfsName) ?? clip.videoOpfsName,
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
      setIsImporting(false)
    }
  }

  return { importLibrary, isImporting }
}
