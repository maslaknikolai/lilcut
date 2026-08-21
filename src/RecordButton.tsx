import { Circle, Square } from 'lucide-react'
import { GhostButton } from './GhostButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

export function RecordButton() {
  const { recording, start, stop } = useScreenRecordingContext()
  const isRecording = recording.status !== 'idle'

  return (
    <GhostButton onClick={() => (isRecording ? stop() : start())}>
      {isRecording ? (
        <Square size={14} />
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
