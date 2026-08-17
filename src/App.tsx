import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProjectsPage } from './ProjectsPage'
import { RecordingPage } from './RecordingPage'
import { TabNav } from './TabNav'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="flex h-svh flex-col">
        <TabNav />

        <div className="flex flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/recording" element={<RecordingPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
