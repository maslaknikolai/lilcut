import { createContext, useContext } from 'react'
import { invariant } from './invariant'
import type { Project } from './types'

type ExportJobContextValue = {
  isExporting: boolean
  exportProgress: number
  logLines: string[]
  startExport: (project: Project) => void
  cancelExport: () => void
}

export const ExportJobContext = createContext<ExportJobContextValue | null>(null)

export function useExportJobContext() {
  const context = useContext(ExportJobContext)
  invariant(context, 'useExportJobContext must be used within an ExportJobProvider')
  return context
}
