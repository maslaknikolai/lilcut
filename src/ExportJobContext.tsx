import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { exportProjectVideo } from './exportProjectVideo'
import { uniqueOpfsName, writeOpfsFile } from './opfs'
import { ExportJobContext } from './useExportJobContext'
import type { Project } from './types'

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

    if (project.clips.length === 0) {
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

      const blob = await exportProjectVideo(ffmpeg, project.clips, mediaFiles, {
        onProgress: (overallProgress) => setExportProgress((prev) => Math.max(prev, overallProgress)),
        onLog: (message) => setLogLines((prev) => [...prev, message]),
        isCancelled: () => isCancelledRef.current,
      })

      if (blob) {
        const exportedId = crypto.randomUUID()
        const exportedOpfsName = uniqueOpfsName(`Exported ${project.name}.mp4`, mediaFiles)
        await writeOpfsFile(exportedOpfsName, blob)
        setMediaFiles((prev) => [
          {
            id: exportedId,
            createdAt: Date.now(),
            opfsName: exportedOpfsName,
            mimeType: 'video/mp4',
          },
          ...prev,
        ])
        setSelectedMediaFileId(exportedId)
        navigate('/files')
        setIsExportComplete(true)
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
