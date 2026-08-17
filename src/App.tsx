import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MediaFilesPage } from './MediaFilesPage'
import { ProjectsPage } from './ProjectsPage'
import { TabNav } from './TabNav'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="flex h-svh flex-col">
        <TabNav />

        <div className="flex flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/files" element={<MediaFilesPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
