import { useEffect, useEffectEvent } from 'react'
import { useAtom } from 'jotai'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { MediaFileItem } from './MediaFileItem'
import { PauseResumeButton } from './PauseResumeButton'
import { RecordButton } from './RecordButton'
import { RecordingPipWindow } from './RecordingPipWindow'
import { ScreenRecordingProvider } from './ScreenRecordingContext'
import { SortingList } from './SortingList'
import { UploadMediaFileButton } from './UploadMediaFileButton'

export function MediaFilesSidebar() {
  const [mediaFiles, setMediaFiles] = useAtom(mediaFilesAtom)
  const [selectedMediaFileId, setSelectedMediaFileId] = useAtom(selectedMediaFileIdAtom)

  // keep a valid selection: autoselect the first file, and reselect
  // after the selected one is deleted
  const syncSelection = useEffectEvent(() => {
    const isValid = !!selectedMediaFileId && mediaFiles.some((file) => file.id === selectedMediaFileId)
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
          <UploadMediaFileButton />
        </div>
        <RecordingPipWindow />
      </ScreenRecordingProvider>

      <SortingList
        items={mediaFiles}
        onReorder={setMediaFiles}
        renderItem={(file, dragProps) => <MediaFileItem file={file} {...dragProps} />}
      />
    </div>
  )
}
