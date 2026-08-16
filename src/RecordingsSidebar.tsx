import { useEffect, useEffectEvent } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { Circle, Square } from 'lucide-react'
import { recordingsAtom, selectedRecordingIdAtom } from './atoms'
import { useScreenRecording } from './useScreenRecording'
import { RecordingItem } from './RecordingItem'

export function RecordingsSidebar() {
  const recordings = useAtomValue(recordingsAtom)
  const [selectedRecordingId, setSelectedRecordingId] = useAtom(selectedRecordingIdAtom)
  const { isRecording, start, stop } = useScreenRecording()

  // keep a valid selection: autoselect the first recording, and reselect
  // after the selected one is deleted
  const syncSelection = useEffectEvent(() => {
    const isValid =
      !!selectedRecordingId && recordings.some((recording) => recording.id === selectedRecordingId)
    if (!isValid) {
      setSelectedRecordingId(recordings[0]?.id ?? null)
    }
  })

  useEffect(() => {
    syncSelection()
  }, [recordings])

  return (
    <div className="flex w-64 flex-col border-r border-neutral-300">
      <div className="border-b border-neutral-300 p-2">
        <span className="text-sm font-semibold text-neutral-900">Recordings</span>
      </div>

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

      <ul className="flex-1 overflow-y-auto">
        {recordings.map((recording) => (
          <RecordingItem key={recording.id} recording={recording} />
        ))}
      </ul>
    </div>
  )
}
