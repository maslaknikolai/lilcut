import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { libraryOrderAtom, videosAtom } from '@/App/atoms'
import { renderProjectVideo } from '@/App/contexts/renderProjectVideo'
import { loadFfmpeg } from '@/App/contexts/loadFfmpeg'
import { uniqueOpfsName } from '@/App/lib/opfs'
import { buildPlaybackClips, buildTimelineClips } from '@/App/lib/projectTimeline'
import type { Project } from '@/App/lib/types'
import { RenderJobContext, type RenderJob } from '@/App/contexts/useRenderJobContext'
import { useVideoActions } from '@/App/lib/useVideoActions'

let ffmpegPromise: Promise<FFmpeg> | null = null

function loadRenderFfmpeg(): Promise<FFmpeg> {
  ffmpegPromise ??= loadFfmpeg()
  return ffmpegPromise
}

export function RenderJobProvider({ children }: { children: ReactNode }) {
  const videos = useAtomValue(videosAtom)
  const { writeVideo } = useVideoActions()
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

      const timelineClips = buildTimelineClips(project.clips, videos)
      const playbackClips = buildPlaybackClips(timelineClips)
      const blob = await renderProjectVideo(ffmpeg, playbackClips, videos, {
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
        const renderedOpfsName = uniqueOpfsName(`${project.name}.mp4`, videos)
        await writeVideo(renderedOpfsName, blob)
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
