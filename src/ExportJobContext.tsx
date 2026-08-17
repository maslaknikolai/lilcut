import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { readOpfsFile, writeOpfsFile } from './opfs'
import { ExportJobContext } from './useExportJobContext'
import type { Clip, MediaFile, Project } from './types'

let ffmpegPromise: Promise<FFmpeg> | null = null

// single-threaded core: no SharedArrayBuffer, so no cross-origin-isolation
// headers needed on the server — trades away multi-threaded speed for that
function loadFfmpeg(): Promise<FFmpeg> {
  ffmpegPromise ??= (async () => {
    const ffmpeg = new FFmpeg()
    await ffmpeg.load({ coreURL, wasmURL })
    return ffmpeg
  })()
  return ffmpegPromise
}

export function ExportJobProvider({ children }: { children: ReactNode }) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const setMediaFiles = useSetAtom(mediaFilesAtom)
  const setSelectedMediaFileId = useSetAtom(selectedMediaFileIdAtom)
  const navigate = useNavigate()

  const [isExporting, setIsExporting] = useState(false)
  const [isExportComplete, setIsExportComplete] = useState(false)
  const [exportingProjectName, setExportingProjectName] = useState<string | null>(null)
  const [exportProgress, setExportProgress] = useState(0)
  const [logLines, setLogLines] = useState<string[]>([])
  const ffmpegInstanceRef = useRef<FFmpeg | null>(null)
  const isCancelledRef = useRef(false)

  const startExport = useEffectEvent(async (project: Project) => {
    if (isExporting) {
      return
    }
    const segments: { clip: Clip; mediaFile: MediaFile }[] = []
    for (const clip of project.clips) {
      const mediaFile = mediaFiles.find((file) => file.id === clip.mediaFileId)
      if (mediaFile) {
        segments.push({ clip, mediaFile })
      }
    }
    if (segments.length === 0) {
      return
    }

    isCancelledRef.current = false
    setIsExporting(true)
    setIsExportComplete(false)
    setExportingProjectName(project.name)
    setExportProgress(0)
    setLogLines([])

    try {
      const ffmpeg = await loadFfmpeg()
      ffmpegInstanceRef.current = ffmpeg

      // each clip trim plus the final concat is one ffmpeg command; progress
      // resets to 0 at the start of each command, so track how many of the
      // total commands are already done to turn per-command progress into
      // one overall percentage
      const totalSteps = segments.length + 1
      let completedSteps = 0
      function handleProgress({ progress }: { progress: number }) {
        // ffmpeg's reported progress isn't guaranteed monotonic within a
        // command (e.g. the concat step's duration estimate can get revised
        // mid-run), so never let the displayed value move backwards
        const clampedProgress = Math.min(1, Math.max(0, progress))
        const overallProgress = (completedSteps + clampedProgress) / totalSteps
        setExportProgress((prev) => Math.max(prev, overallProgress))
      }
      function handleLog({ message }: { message: string }) {
        setLogLines((prev) => [...prev, message])
      }
      ffmpeg.on('progress', handleProgress)
      ffmpeg.on('log', handleLog)

      try {
        const segmentNames: string[] = []

        for (const [index, { clip, mediaFile }] of segments.entries()) {
          if (isCancelledRef.current) {
            return
          }

          const extension = mediaFile.opfsName.split('.').pop()
          const inputName = `input_${index}.${extension}`
          const sourceFile = await readOpfsFile(mediaFile.opfsName)
          await ffmpeg.writeFile(inputName, await fetchFile(sourceFile))

          // -ss/-to after -i decodes from the start for a frame-accurate cut,
          // rather than snapping to the nearest keyframe
          const args = ['-i', inputName, '-ss', String(clip.cutStart ?? 0)]
          if (clip.cutEnd !== undefined) {
            args.push('-to', String(clip.cutEnd))
          }
          const segmentName = `segment_${index}.mp4`
          args.push('-c:v', 'libx264', '-c:a', 'aac', segmentName)
          await ffmpeg.exec(args)
          completedSteps += 1
          await ffmpeg.deleteFile(inputName)
          segmentNames.push(segmentName)
        }

        if (isCancelledRef.current) {
          return
        }

        const concatListName = 'concat.txt'
        const concatList = segmentNames.map((name) => `file '${name}'`).join('\n')
        await ffmpeg.writeFile(concatListName, concatList)
        await ffmpeg.exec([
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          concatListName,
          '-c',
          'copy',
          'output.mp4',
        ])
        completedSteps += 1

        if (isCancelledRef.current) {
          return
        }

        const output = await ffmpeg.readFile('output.mp4')
        const bytes = typeof output === 'string' ? new TextEncoder().encode(output) : output
        const blob = new Blob([new Uint8Array(bytes)], { type: 'video/mp4' })

        const exportedName = `Exported: ${project.name}`
        const exportedId = crypto.randomUUID()
        const exportedOpfsName = `${exportedId}.mp4`
        await writeOpfsFile(exportedOpfsName, blob)
        setMediaFiles((prev) => [
          {
            id: exportedId,
            name: exportedName,
            createdAt: Date.now(),
            opfsName: exportedOpfsName,
            mimeType: 'video/mp4',
          },
          ...prev,
        ])
        setSelectedMediaFileId(exportedId)
        navigate('/files')
        setIsExportComplete(true)

        await ffmpeg.deleteFile(concatListName)
        await ffmpeg.deleteFile('output.mp4')
        for (const name of segmentNames) {
          await ffmpeg.deleteFile(name)
        }
      } finally {
        ffmpeg.off('progress', handleProgress)
        ffmpeg.off('log', handleLog)
      }
    } catch (error) {
      if (!isCancelledRef.current) {
        console.error('Export failed', error)
      }
    } finally {
      ffmpegInstanceRef.current = null
      setIsExporting(false)
    }
  })

  const cancelExport = useEffectEvent(() => {
    if (!isExporting) {
      return
    }
    isCancelledRef.current = true
    // terminate kills the worker outright, so the cached instance/promise
    // can't be reused — next export has to spin up a fresh one
    ffmpegInstanceRef.current?.terminate()
    ffmpegInstanceRef.current = null
    ffmpegPromise = null
    setIsExporting(false)
    setExportProgress(0)
  })

  const dismissExport = useEffectEvent(() => {
    setIsExportComplete(false)
  })

  return (
    <ExportJobContext.Provider
      value={{
        isExporting,
        isExportComplete,
        exportingProjectName,
        exportProgress,
        logLines,
        startExport,
        cancelExport,
        dismissExport,
      }}
    >
      {children}
    </ExportJobContext.Provider>
  )
}
