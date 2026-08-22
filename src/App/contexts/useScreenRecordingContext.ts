import { createContext, useContext } from 'react'
import { invariant } from '@/App/lib/invariant'

export type Segment = { cutStart: number; cutEnd: number }

export type RecordingState =
  | { status: 'idle' }
  | { status: 'countdown'; secondsToStart: number }
  | { status: 'recording'; segments: Segment[]; segmentStartedAt: number }
  | { status: 'paused'; segments: Segment[] }

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
