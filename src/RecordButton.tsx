import { Circle, Square } from 'lucide-react'
import { useScreenRecordingContext } from './useScreenRecordingContext'

export function RecordButton() {
  const { isRecording, start, stop } = useScreenRecordingContext()

  return (
    <button
      type="button"
      onClick={() => (isRecording ? stop() : start())}
      className="m-2 flex items-center justify-center gap-1.5 rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800"
    >
      {isRecording ? (
        <>
          <Square size={14} /> Stop recording
        </>
      ) : (
        <>
          <Circle size={14} fill="currentColor" /> Record screen
        </>
      )}
    </button>
  )
}
