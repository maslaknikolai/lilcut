import { useEffect, useEffectEvent } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { recordingsAtom, selectedRecordingIdAtom } from './atoms'
import { RecordButton } from './RecordButton'
import { RecordingItem } from './RecordingItem'
import { RecordingPipWindow } from './RecordingPipWindow'
import { ScreenRecordingProvider } from './ScreenRecordingContext'

export function RecordingsSidebar() {
  const recordings = useAtomValue(recordingsAtom)
  const [selectedRecordingId, setSelectedRecordingId] = useAtom(selectedRecordingIdAtom)

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

      <ScreenRecordingProvider>
        <RecordButton />
        <RecordingPipWindow />
      </ScreenRecordingProvider>

      <ul className="flex-1 overflow-y-auto">
        {recordings.map((recording) => (
          <RecordingItem key={recording.id} recording={recording} />
        ))}
      </ul>
    </div>
  )
}
