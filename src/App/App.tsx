import { HashRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/App/lib/ui/tooltip'
import { libraryOrderAtom, projectsAtom } from '@/App/atoms'
import { migrateProjects } from '@/App/lib/library'
import { RenderJobProvider } from '@/App/contexts/RenderJobContext'
import { RenderJobWidget } from '@/App/RenderJobWidget'
import { Modals } from '@/App/Modals/Modals'
import { PageView } from '@/App/pages/PageView'
import { Sidebar } from '@/App/Sidebar/Sidebar'
import { RecordingPipWindow } from '@/App/RecordingPipWindow'
import { ScreenRecordingProvider } from '@/App/contexts/ScreenRecordingContext'
import { useSyncIndexedDbAtom } from '@/App/useSyncIndexedDbAtom'
import { useSyncVideos } from '@/App/useSyncVideos'

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
  useSyncIndexedDbAtom(projectsAtom, 'projects', migrateProjects)
  useSyncIndexedDbAtom(libraryOrderAtom, 'libraryOrder')
  useSyncVideos()

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
