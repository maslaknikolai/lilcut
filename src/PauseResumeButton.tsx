import { Pause, Play } from 'lucide-react'
import { useScreenRecordingContext } from './useScreenRecordingContext'

export function PauseResumeButton() {
  const { isRecording, isPaused, pause, resume } = useScreenRecordingContext()

  return (
    <button
      type="button"
      disabled={!isRecording}
      onClick={() => (isPaused ? resume() : pause())}
      className="flex flex-1 items-center justify-center gap-1.5 rounded bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPaused ? (
        <>
          <Play size={14} fill="currentColor" /> Resume
        </>
      ) : (
        <>
          <Pause size={14} fill="currentColor" /> Pause
        </>
      )}
    </button>
  )
}
