import { Circle, Square } from 'lucide-react'
import { GhostButton } from './GhostButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

type RecordButtonProps = {
  isWithLabel?: boolean
}

export function RecordButton({ isWithLabel }: RecordButtonProps) {
  const { recording, start, stop } = useScreenRecordingContext()
  const isRecording = recording.status !== 'idle'

  return (
    <GhostButton
      onClick={() => (isRecording ? stop() : start())}
      className="text-red-400"
    >
      {isRecording ? (
        <Square size={14} />
      ) : (
        <Circle
          size={14}
          fill="currentColor"
        />
      )}
      {isWithLabel && <span>{isRecording ? 'Stop' : 'Record screen'}</span>}
    </GhostButton>
  )
}
