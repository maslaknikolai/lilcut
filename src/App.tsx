import { libraryOrderAtom, projectsAtom } from './atoms'
import { ExportJobProvider } from './ExportJobContext'
import { ExportJobWidget } from './ExportJobWidget'
import { LibraryPage } from './LibraryPage'
import { RecordingPipWindow } from './RecordingPipWindow'
import { ScreenRecordingProvider } from './ScreenRecordingContext'
import { useIndexedDbAtom } from './useIndexedDbAtom'
import { useSyncMediaAssets } from './useSyncMediaAssets'

export function App() {
  useIndexedDbAtom(projectsAtom, 'projects')
  useIndexedDbAtom(libraryOrderAtom, 'libraryOrder')
  useSyncMediaAssets()

  return (
    <ExportJobProvider>
      <ScreenRecordingProvider>
        <div className="flex h-svh overflow-hidden">
          <LibraryPage />
        </div>

        <div className="fixed top-2 right-2">
          <ExportJobWidget />
        </div>

        <RecordingPipWindow />
      </ScreenRecordingProvider>
    </ExportJobProvider>
  )
}
