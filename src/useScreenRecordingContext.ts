import { createContext, useContext } from 'react'
import { invariant } from './invariant'

export type RecordingState = { status: 'idle' } | { status: 'recording' } | { status: 'paused' }

type ScreenRecordingContextValue = {
  recording: RecordingState
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
}

export const ScreenRecordingContext = createContext<ScreenRecordingContextValue | null>(null)

export function useScreenRecordingContext() {
  const context = useContext(ScreenRecordingContext)
  invariant(context, 'useScreenRecordingContext must be used within a ScreenRecordingProvider')
  return context
}
