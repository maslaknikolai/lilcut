import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { libraryOrderAtom, mediaAssetsAtom } from './atoms'
import { exportProjectVideo } from './exportProjectVideo'
import { loadFfmpeg } from './loadFfmpeg'
import { uniqueOpfsName } from './opfs'
import { buildPlaybackClips, buildTimelineClips } from './projectTimeline'
import type { Project } from './types'
import { ExportJobContext, type ExportJob } from './useExportJobContext'
import { useMediaAssetActions } from './useMediaAssetActions'

let ffmpegPromise: Promise<FFmpeg> | null = null

function loadExportFfmpeg(): Promise<FFmpeg> {
  ffmpegPromise ??= loadFfmpeg()
  return ffmpegPromise
}

export function ExportJobProvider({ children }: { children: ReactNode }) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

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
      const ffmpeg = await loadExportFfmpeg()
      ffmpegInstanceRef.current = ffmpeg

      const timelineClips = buildTimelineClips(project, mediaAssets)
      const playbackClips = buildPlaybackClips(timelineClips)
      const blob = await exportProjectVideo(ffmpeg, playbackClips, mediaAssets, {
        onProgress: (overallProgress) =>
          setJob((prev) => {
            if (prev.status !== 'exporting') {
              return prev
            }
            return { ...prev, progress: Math.max(prev.progress, overallProgress) }
          }),
        onLog: (message) =>
          setJob((prev) => {
            if (prev.status !== 'exporting') {
              return prev
            }
            return { ...prev, logLines: [...prev.logLines, message] }
          }),
        isCancelled: () => isCancelledRef.current,
      })

      if (blob) {
        const exportedOpfsName = uniqueOpfsName(`${project.name}.mp4`, mediaAssets)
        await writeMediaAsset(exportedOpfsName, blob)
        setLibraryOrder((prev) => [exportedOpfsName, ...prev])
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
