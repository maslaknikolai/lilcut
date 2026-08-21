import { Pause, Play } from 'lucide-react'
import { GhostButton } from './GhostButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

type PauseResumeButtonProps = {
  isWithLabel?: boolean
}

export function PauseResumeButton({ isWithLabel }: PauseResumeButtonProps) {
  const { recording, pause, resume } = useScreenRecordingContext()

  if (recording.status === 'idle') {
    return null
  }
  const isPaused = recording.status === 'paused'

  return (
    <GhostButton
      onClick={() => (isPaused ? resume() : pause())}
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
      {isWithLabel && <span>{isPaused ? 'Resume' : 'Pause'}</span>}
    </GhostButton>
  )
}
