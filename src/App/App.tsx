import { HashRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/App/lib/ui/tooltip'
import { libraryOrderAtom, projectsAtom } from '@/App/atoms'
import { RenderJobProvider } from '@/App/contexts/RenderJobContext'
import { RenderJobWidget } from '@/App/RenderJobWidget'
import { Modals } from '@/App/Modals/Modals'
import { PageView } from '@/App/pages/PageView'
import { Sidebar } from '@/App/Sidebar/Sidebar'
import { RecordingPipWindow } from '@/App/RecordingPipWindow'
import { ScreenRecordingProvider } from '@/App/contexts/ScreenRecordingContext'
import { useSyncIndexedDbAtom } from '@/App/useSyncIndexedDbAtom'
import { useSyncMediaAssets } from '@/App/useSyncMediaAssets'

function AppContent() {
  return (
    <TooltipProvider>
      <RenderJobProvider>
        <ScreenRecordingProvider>
          <div className="flex h-svh overflow-hidden">
            <Sidebar />
            <PageView />
          </div>

          <div className="fixed top-2 right-2">
            <RenderJobWidget />
          </div>

          <RecordingPipWindow />
          <Modals />
        </ScreenRecordingProvider>
      </RenderJobProvider>
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
