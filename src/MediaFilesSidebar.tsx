import { useEffect, useEffectEvent } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { AddMediaFileButton } from './AddMediaFileButton'
import { MediaFileItem } from './MediaFileItem'
import { PauseResumeButton } from './PauseResumeButton'
import { RecordButton } from './RecordButton'
import { RecordingPipWindow } from './RecordingPipWindow'
import { ScreenRecordingProvider } from './ScreenRecordingContext'

export function MediaFilesSidebar() {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const [selectedMediaFileId, setSelectedMediaFileId] = useAtom(selectedMediaFileIdAtom)

  // keep a valid selection: autoselect the first file, and reselect
  // after the selected one is deleted
  const syncSelection = useEffectEvent(() => {
    const isValid =
      !!selectedMediaFileId && mediaFiles.some((file) => file.id === selectedMediaFileId)
    if (!isValid) {
      setSelectedMediaFileId(mediaFiles[0]?.id ?? null)
    }
  })

  useEffect(() => {
    syncSelection()
  }, [mediaFiles])

  return (
    <div className="flex w-64 flex-col border-r border-neutral-300">
      <ScreenRecordingProvider>
        <div className="flex gap-2 p-2">
          <RecordButton />
          <PauseResumeButton />
          <AddMediaFileButton />
        </div>
        <RecordingPipWindow />
      </ScreenRecordingProvider>

      <ul className="flex-1 overflow-y-auto">
        {mediaFiles.map((file) => (
          <MediaFileItem key={file.id} file={file} />
        ))}
      </ul>
    </div>
  )
}
