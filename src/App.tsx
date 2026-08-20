import { HashRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { libraryOrderAtom, projectsAtom } from './atoms'
import { ExportJobProvider } from './ExportJobContext'
import { ExportJobWidget } from './ExportJobWidget'
import { PageView } from './PageView'
import { Sidebar } from './Sidebar'
import { RecordingPipWindow } from './RecordingPipWindow'
import { ScreenRecordingProvider } from './ScreenRecordingContext'
import { useSyncIndexedDbAtom } from './useSyncIndexedDbAtom'
import { useSyncMediaAssets } from './useSyncMediaAssets'

function AppContent() {
  return (
    <TooltipProvider>
      <ExportJobProvider>
        <ScreenRecordingProvider>
          <div className="flex h-svh overflow-hidden">
            <Sidebar />
            <PageView />
          </div>

          <div className="fixed top-2 right-2">
            <ExportJobWidget />
          </div>

          <RecordingPipWindow />
          {/* TODO <Modal />  */}
        </ScreenRecordingProvider>
      </ExportJobProvider>
    </TooltipProvider>
  )
}

export function App() {
  useSyncIndexedDbAtom(projectsAtom, 'projects')
  useSyncIndexedDbAtom(libraryOrderAtom, 'libraryOrder')
  useSyncMediaAssets()

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/:selectedId?"
          element={<AppContent />}
        />
      </Routes>
    </HashRouter>
  )
}
