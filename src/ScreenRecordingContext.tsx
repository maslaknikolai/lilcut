import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { libraryOrderAtom, mediaAssetsAtom, projectsAtom, selectedLibraryItemIdAtom } from './atoms'
import { uniqueOpfsName } from './opfs'
import type { Clip, Project } from './types'
import { useMediaAssetActions } from './useMediaAssetActions'
import { ScreenRecordingContext, type RecordingState, type Segment } from './useScreenRecordingContext'

// e.g. rec_09_25_2026_16_45_59.mp4
function formatRecordingOpfsName(date: Date, extension: string): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = [
    date.getMonth() + 1,
    date.getDate(),
    date.getFullYear(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ]
    .map(pad)
    .join('_')
  return `rec_${stamp}.${extension}`
}

// prefer mp4 where the browser can record it directly (Safari, recent Chrome);
// Firefox and older Chrome only support webm, so fall back to that
const MIME_TYPE_CANDIDATES = [
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm',
]

function pickSupportedMimeType(): string {
  return MIME_TYPE_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? 'video/webm'
}

function totalDuration(segments: Segment[]): number {
  return segments.reduce((sum, segment) => sum + (segment.cutEnd - segment.cutStart), 0)
}

export function ScreenRecordingProvider({ children }: { children: ReactNode }) {
  const [recording, setRecording] = useState<RecordingState>({ status: 'idle' })
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setProjects = useSetAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const setSelectedLibraryItemId = useSetAtom(selectedLibraryItemIdAtom)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const finishRecording = useEffectEvent(async (blob: Blob) => {
    const closedSegments = recording.status === 'idle' ? [] : recording.segments

    const extension = blob.type.includes('mp4') ? 'mp4' : 'webm'
    const opfsName = uniqueOpfsName(formatRecordingOpfsName(new Date(), extension), mediaAssets)

    await writeMediaAsset(opfsName, blob)

    const clips: Clip[] = closedSegments.map((segment) => ({
      id: crypto.randomUUID(),
      mediaAssetOpfsName: opfsName,
      cutStart: segment.cutStart,
      cutEnd: segment.cutEnd,
    }))

    if (recording.status === 'recording') {
      clips.push({ id: crypto.randomUUID(), mediaAssetOpfsName: opfsName, cutStart: totalDuration(recording.segments) })
    }

    const lastClip = clips.at(-1)
    if (lastClip) {
      lastClip.cutEnd = undefined
    }

    const projectId = crypto.randomUUID()
    const newProject: Project = { id: projectId, name: `Project: ${opfsName}`, clips }
    setProjects((prev) => [newProject, ...prev])

    setLibraryOrder((prev) => [opfsName, projectId, ...prev])
    setSelectedLibraryItemId(projectId)
    setRecording({ status: 'idle' })
  })

  const start = useEffectEvent(async () => {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    const micStream = await (async () => {
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        return null
      }
    })()

    const audioContext = new AudioContext()
    const mixedAudio = audioContext.createMediaStreamDestination()
    const mixedAudioTracks = [...displayStream.getAudioTracks(), ...(micStream?.getAudioTracks() ?? [])]

    for (const track of mixedAudioTracks) {
      audioContext.createMediaStreamSource(new MediaStream([track])).connect(mixedAudio)
    }

    const stream = new MediaStream([...displayStream.getVideoTracks(), ...mixedAudio.stream.getAudioTracks()])
    const mimeType = pickSupportedMimeType()
    const recorder = new MediaRecorder(stream, { mimeType })
    chunksRef.current = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    // stopping only `stream` leaves the original capture tracks running
    // (share/mic indicators stay on), so stop every source explicitly
    const stopAllTracks = () => {
      displayStream.getTracks().forEach((track) => track.stop())
      micStream?.getTracks().forEach((track) => track.stop())
      audioContext.close()
    }

    recorder.onstop = async () => {
      stopAllTracks()
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
      await finishRecording(blob)
    }

    stream.getVideoTracks()[0].addEventListener('ended', () => recorder.stop())

    recorder.start()
    recorderRef.current = recorder
    setRecording({ status: 'recording', segments: [], segmentStartedAt: Date.now() })
  })

  const stop = useEffectEvent(() => {
    recorderRef.current?.stop()
  })

  const pause = useEffectEvent(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'recording' || recording.status !== 'recording') {
      return
    }
    recorder.pause()
    const cutStart = totalDuration(recording.segments)
    const cutEnd = cutStart + (Date.now() - recording.segmentStartedAt) / 1000
    setRecording({ status: 'paused', segments: [...recording.segments, { cutStart, cutEnd }] })
  })

  const resume = useEffectEvent(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'paused' || recording.status !== 'paused') {
      return
    }
    recorder.resume()
    setRecording({ status: 'recording', segments: recording.segments, segmentStartedAt: Date.now() })
  })

  return (
    <ScreenRecordingContext.Provider value={{ recording, start, stop, pause, resume }}>
      {children}
    </ScreenRecordingContext.Provider>
  )
}
