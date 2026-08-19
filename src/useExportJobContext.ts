import { createContext, useContext } from 'react'
import { invariant } from './invariant'
import type { Project } from './types'

export type ExportJob =
  | { status: 'idle' }
  | { status: 'exporting'; projectName: string; progress: number; logLines: string[] }
  | { status: 'complete'; projectName: string }

type ExportJobContextValue = {
  job: ExportJob
  startExport: (project: Project) => void
  cancelExport: () => void
  dismissExport: () => void
}

export const ExportJobContext = createContext<ExportJobContextValue | null>(null)

export function useExportJobContext() {
  const context = useContext(ExportJobContext)
  invariant(context, 'useExportJobContext must be used within an ExportJobProvider')
  return context
}
