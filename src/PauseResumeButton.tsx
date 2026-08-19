import { Pause, Play } from 'lucide-react'
import { ActionButton } from './ActionButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

export function PauseResumeButton() {
  const { recording, pause, resume } = useScreenRecordingContext()

  if (recording.status === 'idle') {
    return null
  }
  const isPaused = recording.status === 'paused'

  return (
    <ActionButton
      onClick={() => (isPaused ? resume() : pause())}
      className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPaused ? (
        <Play
          size={14}
          fill="currentColor"
        />
      ) : (
        <Pause
          size={14}
          fill="currentColor"
        />
      )}
    </ActionButton>
  )
}
