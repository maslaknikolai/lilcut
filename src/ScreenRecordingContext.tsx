import { useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { useSetAtom } from 'jotai'
import {
  mediaFilesAtom,
  projectsAtom,
  selectedMediaFileIdAtom,
  selectedProjectIdAtom,
} from './atoms'
import { writeOpfsFile } from './opfs'
import { ScreenRecordingContext } from './useScreenRecordingContext'

function formatRecordingName(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  return `${day} ${time}`
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
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const setMediaFiles = useSetAtom(mediaFilesAtom)
  const setSelectedMediaFileId = useSetAtom(selectedMediaFileIdAtom)
  const setProjects = useSetAtom(projectsAtom)
  const setSelectedProjectId = useSetAtom(selectedProjectIdAtom)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // MediaRecorder.pause()/resume() already produce one gapless output, so all
  // we track here is where each active (non-paused) stretch lands on that
  // output's timeline, in seconds — that becomes the new project's clips
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
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // MediaRecorder only reliably encodes one audio track, so mix system
    // and mic audio down to a single track via the Web Audio API
    const audioContext = new AudioContext()
    const mixedAudio = audioContext.createMediaStreamDestination()
    const mixedAudioTracks = [...displayStream.getAudioTracks(), ...micStream.getAudioTracks()]

    for (const track of mixedAudioTracks) {
      audioContext.createMediaStreamSource(new MediaStream([track])).connect(mixedAudio)
    }

    const stream = new MediaStream([
      ...displayStream.getVideoTracks(),
      ...mixedAudio.stream.getAudioTracks(),
    ])
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
      micStream.getTracks().forEach((track) => track.stop())
      audioContext.close()
    }

    recorder.onstop = async () => {
      closeCurrentSegment()
      stopAllTracks()
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
      const mediaFileId = crypto.randomUUID()
      const extension = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
      const opfsName = `${mediaFileId}.${extension}`
      await writeOpfsFile(opfsName, blob)

      const mediaFileName = `Recording ${formatRecordingName(new Date())}`
      setMediaFiles((prev) => [
        {
          id: mediaFileId,
          name: mediaFileName,
          createdAt: Date.now(),
          opfsName,
          mimeType: recorder.mimeType,
        },
        ...prev,
      ])
      setSelectedMediaFileId(mediaFileId)

      const projectId = crypto.randomUUID()
      const clips = segmentsRef.current.map((segment) => ({
        id: crypto.randomUUID(),
        mediaFileId,
        cutStart: segment.cutStart,
        cutEnd: segment.cutEnd,
      }))
      setProjects((prev) => [{ id: projectId, name: `Project: ${mediaFileName}`, clips }, ...prev])
      setSelectedProjectId(projectId)

      setIsRecording(false)
      setIsPaused(false)
    }

    // browser's own "Stop sharing" UI ends the track without calling recorder.stop()
    stream.getVideoTracks()[0].addEventListener('ended', () => recorder.stop())

    recorder.start()
    recorderRef.current = recorder
    startSegment()
    setIsRecording(true)
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
    setIsPaused(true)
  })

  const resume = useEffectEvent(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'paused') {
      return
    }
    recorder.resume()
    startSegment()
    setIsPaused(false)
  })

  return (
    <ScreenRecordingContext.Provider value={{ isRecording, isPaused, start, stop, pause, resume }}>
      {children}
    </ScreenRecordingContext.Provider>
  )
}
