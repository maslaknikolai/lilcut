import { useSetAtom } from 'jotai'
import { Menu } from 'lucide-react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { isSidebarOpenAtom, libraryOrderAtom, projectsAtom } from './atoms'
import { ExportJobProvider } from './ExportJobContext'
import { ExportJobWidget } from './ExportJobWidget'
import { Modals } from './Modals'
import { PageView } from './PageView'
import { Sidebar } from './Sidebar'
import { RecordingPipWindow } from './RecordingPipWindow'
import { ScreenRecordingProvider } from './ScreenRecordingContext'
import { useSyncIndexedDbAtom } from './useSyncIndexedDbAtom'
import { useSyncMediaAssets } from './useSyncMediaAssets'

function AppContent() {
  const setIsSidebarOpen = useSetAtom(isSidebarOpenAtom)

  return (
    <TooltipProvider>
      <ExportJobProvider>
        <ScreenRecordingProvider>
          <div className="flex h-svh overflow-hidden">
            <Sidebar />
            <PageView />
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            className="touch-target fixed bottom-2 left-2 z-20 cursor-pointer rounded border border-slate-700 bg-slate-900 p-2 text-slate-300 active:bg-slate-800 md:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="fixed top-2 right-2">
            <ExportJobWidget />
          </div>

          <RecordingPipWindow />
          <Modals />
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
