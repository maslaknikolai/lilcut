import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useSetAtom } from 'jotai'
import { recordingsAtom, selectedRecordingIdAtom } from './atoms'
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

export function ScreenRecordingProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false)
  const setRecordings = useSetAtom(recordingsAtom)
  const setSelectedRecordingId = useSetAtom(selectedRecordingIdAtom)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = useCallback(async () => {
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
      stopAllTracks()
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
      const id = crypto.randomUUID()
      const extension = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
      const opfsName = `${id}.${extension}`
      await writeOpfsFile(opfsName, blob)

      setRecordings((prev) => [
        {
          id,
          name: formatRecordingName(new Date()),
          createdAt: Date.now(),
          opfsName,
          mimeType: recorder.mimeType,
        },
        ...prev,
      ])
      setSelectedRecordingId(id)
      setIsRecording(false)
    }

    // browser's own "Stop sharing" UI ends the track without calling recorder.stop()
    stream.getVideoTracks()[0].addEventListener('ended', () => recorder.stop())

    recorder.start()
    recorderRef.current = recorder
    setIsRecording(true)
  }, [setRecordings, setSelectedRecordingId])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
  }, [])

  return (
    <ScreenRecordingContext.Provider value={{ isRecording, start, stop }}>
      {children}
    </ScreenRecordingContext.Provider>
  )
}
