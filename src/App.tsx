import { RecordingsSidebar } from './RecordingsSidebar'
import { Player } from './Player'

export function App() {
  return (
    <div className="flex h-svh">
      <RecordingsSidebar />
      <Player />
    </div>
  )
}
