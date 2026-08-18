import { Circle, Square } from 'lucide-react'
import { SidebarActionButton } from './SidebarActionButton'
import { useScreenRecordingContext } from './useScreenRecordingContext'

export function RecordButton() {
  const { isRecording, start, stop } = useScreenRecordingContext()

  return (
    <SidebarActionButton
      onClick={() => (isRecording ? stop() : start())}
      className="bg-red-700 text-white hover:bg-red-800"
    >
      {isRecording ? <Square size={14} /> : <Circle size={14} fill="currentColor" />}
    </SidebarActionButton>
  )
}
