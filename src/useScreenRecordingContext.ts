import { createContext, useContext } from 'react'
import { invariant } from './invariant'

type ScreenRecordingContextValue = {
  isRecording: boolean
  start: () => void
  stop: () => void
}

export const ScreenRecordingContext = createContext<ScreenRecordingContextValue | null>(null)

export function useScreenRecordingContext() {
  const context = useContext(ScreenRecordingContext)
  invariant(context, 'useScreenRecordingContext must be used within a ScreenRecordingProvider')
  return context
}
