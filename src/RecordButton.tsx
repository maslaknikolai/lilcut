import { Circle, Square } from 'lucide-react'
import { ActionButton } from './ActionButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

type RecordButtonProps = {
  isWithLabel?: boolean
}

export function RecordButton({ isWithLabel }: RecordButtonProps) {
  const { recording, start, stop } = useScreenRecordingContext()
  const isRecording = recording.status !== 'idle'

  return (
    <ActionButton
      onClick={() => (isRecording ? stop() : start())}
      className="border-slate-700 text-red-400 hover:bg-slate-900"
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
    </ActionButton>
  )
}
