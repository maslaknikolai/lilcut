import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { libraryOrderAtom, mediaAssetsAtom } from './atoms'
import { renderProjectVideo } from './renderProjectVideo'
import { loadFfmpeg } from './loadFfmpeg'
import { uniqueOpfsName } from './opfs'
import { buildPlaybackClips, buildTimelineClips } from './projectTimeline'
import type { Project } from './types'
import { RenderJobContext, type RenderJob } from './useRenderJobContext'
import { useMediaAssetActions } from './useMediaAssetActions'

let ffmpegPromise: Promise<FFmpeg> | null = null

function loadRenderFfmpeg(): Promise<FFmpeg> {
  ffmpegPromise ??= loadFfmpeg()
  return ffmpegPromise
}

export function RenderJobProvider({ children }: { children: ReactNode }) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

  const [job, setJob] = useState<RenderJob>({ status: 'idle' })
  const ffmpegInstanceRef = useRef<FFmpeg | null>(null)
  const isCancelledRef = useRef(false)

  const startRender = useEffectEvent(async (project: Project) => {
    if (job.status === 'rendering') {
      return
    }

    if (project.clips.length === 0) {
      return
    }

    isCancelledRef.current = false
    setJob({ status: 'rendering', projectName: project.name, progress: 0, logLines: [] })

    try {
      const ffmpeg = await loadRenderFfmpeg()
      ffmpegInstanceRef.current = ffmpeg

      const timelineClips = buildTimelineClips(project.clips, mediaAssets)
      const playbackClips = buildPlaybackClips(timelineClips)
      const blob = await renderProjectVideo(ffmpeg, playbackClips, mediaAssets, {
        onProgress: (overallProgress) =>
          setJob((prev) => {
            if (prev.status !== 'rendering') {
              return prev
            }
            return { ...prev, progress: Math.max(prev.progress, overallProgress) }
          }),
        onLog: (message) =>
          setJob((prev) => {
            if (prev.status !== 'rendering') {
              return prev
            }
            return { ...prev, logLines: [...prev.logLines, message] }
          }),
        isCancelled: () => isCancelledRef.current,
      })

      if (blob) {
        const renderedOpfsName = uniqueOpfsName(`${project.name}.mp4`, mediaAssets)
        await writeMediaAsset(renderedOpfsName, blob)
        setLibraryOrder((prev) => [renderedOpfsName, ...prev])
        setJob({
          status: 'complete',
          projectName: project.name,
          renderedOpfsName,
        })
      }
    } catch (error) {
      if (!isCancelledRef.current) {
        console.error('Render failed', error)
      }
    } finally {
      ffmpegInstanceRef.current = null
      setJob((prev) => (prev.status === 'rendering' ? { status: 'idle' } : prev))
    }
  })

  const cancelRender = useEffectEvent(() => {
    if (job.status !== 'rendering') {
      return
    }
    isCancelledRef.current = true
    ffmpegInstanceRef.current?.terminate()
    ffmpegInstanceRef.current = null
    ffmpegPromise = null
    setJob({ status: 'idle' })
  })

  const dismissRender = useEffectEvent(() => {
    setJob((prev) => (prev.status === 'complete' ? { status: 'idle' } : prev))
  })

  return (
    <RenderJobContext.Provider
      value={{
        job,
        startRender,
        cancelRender,
        dismissRender,
      }}
    >
      {children}
    </RenderJobContext.Provider>
  )
}
