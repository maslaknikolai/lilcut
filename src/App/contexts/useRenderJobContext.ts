import { createContext, useContext } from 'react'
import { invariant } from '@/App/lib/invariant'
import type { Project } from '@/App/lib/types'

export type RenderJob =
  | { status: 'idle' }
  | { status: 'rendering'; projectName: string; progress: number; logLines: string[] }
  | { status: 'complete'; projectName: string; renderedOpfsName: string }

type RenderJobContextValue = {
  job: RenderJob
  startRender: (project: Project) => void
  cancelRender: () => void
  dismissRender: () => void
}

export const RenderJobContext = createContext<RenderJobContextValue | null>(null)

export function useRenderJobContext() {
  const context = useContext(RenderJobContext)
  invariant(context, 'useRenderJobContext must be used within an RenderJobProvider')
  return context
}
