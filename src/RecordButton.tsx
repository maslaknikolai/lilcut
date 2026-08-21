import { Circle, Square } from 'lucide-react'
import { GhostButton } from './GhostButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

// absent on mobile browsers (iOS Safari, Chrome Android)
const isScreenRecordingSupported = typeof navigator.mediaDevices?.getDisplayMedia === 'function'

export function RecordButton() {
  const { recording, start, stop } = useScreenRecordingContext()
  const isRecording = recording.status !== 'idle'

  if (!isScreenRecordingSupported) {
    return null
  }

  return (
    <GhostButton onClick={() => (isRecording ? stop() : start())}>
      {isRecording ? (
        <Square
          size={14}
          className="text-red-400"
          fill="currentColor"
        />
      ) : (
        <Circle
          size={14}
          className="text-red-400"
          fill="currentColor"
        />
      )}
      {isRecording || <span>Record screen</span>}
    </GhostButton>
  )
}
