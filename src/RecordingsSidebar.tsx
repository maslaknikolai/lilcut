import { useEffect, useEffectEvent } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { ChevronRight, ChevronLeft, Circle, Square } from 'lucide-react'
import { recordingsAtom, selectedRecordingIdAtom, sidebarOpenAtom } from './atoms'
import { useScreenRecording } from './useScreenRecording'
import { RecordingItem } from './RecordingItem'

export function RecordingsSidebar() {
  const recordings = useAtomValue(recordingsAtom)
  const [selectedId, setSelectedId] = useAtom(selectedRecordingIdAtom)
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom)
  const { isRecording, start, stop } = useScreenRecording()

  // keep a valid selection: autoselect the first recording, and reselect
  // after the selected one is deleted
  const syncSelection = useEffectEvent(() => {
    if (selectedId !== null && recordings.some((recording) => recording.id === selectedId)) {
      return
    }
    setSelectedId(recordings[0]?.id ?? null)
  })

  useEffect(() => {
    syncSelection()
  }, [recordings])

  if (!isOpen) {
    return (
      <div className="flex w-10 flex-col items-center border-r border-neutral-300 py-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded p-1 text-neutral-900 hover:bg-neutral-200"
          aria-label="Open recordings list"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-64 flex-col border-r border-neutral-300">
      <div className="flex items-center justify-between border-b border-neutral-300 p-2">
        <span className="text-sm font-semibold text-neutral-900">Recordings</span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded p-1 text-neutral-900 hover:bg-neutral-200"
          aria-label="Close recordings list"
        >
          <ChevronLeft size={16} />
        </button>
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
