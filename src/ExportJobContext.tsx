import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { exportProjectVideo } from './exportProjectVideo'
import { uniqueOpfsName, writeOpfsFile } from './opfs'
import { ExportJobContext, type ExportJob } from './useExportJobContext'
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

  const [job, setJob] = useState<ExportJob>({ status: 'idle' })
  const ffmpegInstanceRef = useRef<FFmpeg | null>(null)
  const isCancelledRef = useRef(false)

  const startExport = useEffectEvent(async (project: Project) => {
    if (job.status === 'exporting') {
      return
    }

    if (project.clips.length === 0) {
      return
    }

    isCancelledRef.current = false
    setJob({ status: 'exporting', projectName: project.name, progress: 0, logLines: [] })

    try {
      const ffmpeg = await loadFfmpeg()
      ffmpegInstanceRef.current = ffmpeg

      const blob = await exportProjectVideo(ffmpeg, project.clips, mediaFiles, {
        onProgress: (overallProgress) =>
          setJob((prev) => {
            return prev.status === 'exporting' ? { ...prev, progress: Math.max(prev.progress, overallProgress) } : prev
          }),
        onLog: (message) =>
          setJob((prev) => (prev.status === 'exporting' ? { ...prev, logLines: [...prev.logLines, message] } : prev)),
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
        setJob({
          status: 'complete',
          projectName: project.name,
        })
      }
    } catch (error) {
      if (!isCancelledRef.current) {
        console.error('Export failed', error)
      }
    } finally {
      ffmpegInstanceRef.current = null
      setJob((prev) => (prev.status === 'exporting' ? { status: 'idle' } : prev))
    }
  })

  const cancelExport = useEffectEvent(() => {
    if (job.status !== 'exporting') {
      return
    }
    isCancelledRef.current = true
    // terminate kills the worker outright, so the cached instance/promise
    // can't be reused — next export has to spin up a fresh one
    ffmpegInstanceRef.current?.terminate()
    ffmpegInstanceRef.current = null
    ffmpegPromise = null
    setJob({ status: 'idle' })
  })

  const dismissExport = useEffectEvent(() => {
    setJob((prev) => (prev.status === 'complete' ? { status: 'idle' } : prev))
  })

  return (
    <ExportJobContext.Provider
      value={{
        job,
        startExport,
        cancelExport,
        dismissExport,
      }}
    >
      {children}
    </ExportJobContext.Provider>
  )
}
