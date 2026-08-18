import { Pause, Play } from 'lucide-react'
import { SidebarActionButton } from './SidebarActionButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

export function PauseResumeButton() {
  const { isRecording, isPaused, pause, resume } = useScreenRecordingContext()

  if (!isRecording) {
    return null
  }

  return (
    <SidebarActionButton
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
    </SidebarActionButton>
  )
}
