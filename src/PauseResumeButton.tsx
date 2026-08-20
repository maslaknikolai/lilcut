import { Pause, Play } from 'lucide-react'
import { ActionButton } from './ActionButton'
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
    <ActionButton
      onClick={() => (isPaused ? resume() : pause())}
      className="bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    </ActionButton>
  )
}
