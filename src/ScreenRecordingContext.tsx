import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { mediaAssetsAtom, projectsAtom, selectedLibraryItemIdAtom } from './atoms'
import { uniqueOpfsName } from './opfs'
import type { Project } from './types'
import { useMediaAssetActions } from './useMediaAssetActions'
import { ScreenRecordingContext, type RecordingState } from './useScreenRecordingContext'

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

type Segment = {
  cutStart: number
  cutEnd: number
}

export function ScreenRecordingProvider({ children }: { children: ReactNode }) {
  const [recording, setRecording] = useState<RecordingState>({ status: 'idle' })
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const { writeMediaAsset } = useMediaAssetActions()
  const setProjects = useSetAtom(projectsAtom)
  const setSelectedLibraryItemId = useSetAtom(selectedLibraryItemIdAtom)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const segmentsRef = useRef<Segment[]>([])
  const activeDurationRef = useRef(0)
  const segmentStartRef = useRef<number | null>(null)

  function startSegment() {
    segmentStartRef.current = Date.now()
  }

  function closeCurrentSegment() {
    if (segmentStartRef.current === null) {
      return
    }
    const cutStart = activeDurationRef.current
    const cutEnd = cutStart + (Date.now() - segmentStartRef.current) / 1000
    segmentsRef.current.push({ cutStart, cutEnd })
    activeDurationRef.current = cutEnd
    segmentStartRef.current = null
  }

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
    segmentsRef.current = []
    activeDurationRef.current = 0

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
      closeCurrentSegment()
      stopAllTracks()
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
      const extension = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
      const now = new Date()
      const opfsName = uniqueOpfsName(formatRecordingOpfsName(now, extension), mediaAssets)

      await writeMediaAsset(opfsName, blob)

      const projectId = crypto.randomUUID()
      const newProject: Project = {
        id: projectId,
        name: `Project: ${opfsName}`,
        clips: segmentsRef.current.map((segment) => ({
          id: crypto.randomUUID(),
          mediaAssetOpfsName: opfsName,
          cutStart: segment.cutStart,
          cutEnd: segment.cutEnd,
        })),
      }

      setProjects((prev) => [newProject, ...prev])
      setSelectedLibraryItemId(projectId)

      setRecording({ status: 'idle' })
    }

    stream.getVideoTracks()[0].addEventListener('ended', () => recorder.stop())

    recorder.start()
    recorderRef.current = recorder
    startSegment()
    setRecording({ status: 'recording' })
  })

  const stop = useEffectEvent(() => {
    recorderRef.current?.stop()
  })

  const pause = useEffectEvent(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'recording') {
      return
    }
    recorder.pause()
    closeCurrentSegment()
    setRecording({ status: 'paused' })
  })

  const resume = useEffectEvent(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'paused') {
      return
    }
    recorder.resume()
    startSegment()
    setRecording({ status: 'recording' })
  })

  return (
    <ScreenRecordingContext.Provider value={{ recording, start, stop, pause, resume }}>
      {children}
    </ScreenRecordingContext.Provider>
  )
}
