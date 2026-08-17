import { useExportJobContext } from './useExportJobContext'
import type { Project } from './types'

type ExportProjectButtonProps = {
  project: Project
}

export function ExportProjectButton({ project }: ExportProjectButtonProps) {
  const { isExporting, startExport } = useExportJobContext()

  return (
    <button
      type="button"
      onClick={() => startExport(project)}
      disabled={isExporting || project.clips.length === 0}
      className="flex shrink-0 items-center gap-1.5 rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isExporting ? 'Exporting…' : 'Export mp4'}
    </button>
  )
}
