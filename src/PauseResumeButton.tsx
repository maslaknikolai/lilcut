import { Pause, Play } from 'lucide-react'
import { GhostButton } from './GhostButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

export function PauseResumeButton() {
  const { recording, pause, resume } = useScreenRecordingContext()

  if (recording.status === 'idle') {
    return null
  }
  const isPaused = recording.status === 'paused'

  return (
    <GhostButton
      onClick={() => (isPaused ? resume() : pause())}
      className="text-slate-200"
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
    </GhostButton>
  )
}
