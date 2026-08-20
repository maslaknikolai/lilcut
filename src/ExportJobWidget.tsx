import { OctagonX, X } from 'lucide-react'
import { useExportJobContext } from './useExportJobContext'

export function ExportJobWidget() {
  const { job, cancelExport, dismissExport } = useExportJobContext()

  if (job.status === 'idle') {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">
      {job.status === 'exporting' ? (
        <>
          <span>
            Exporting "{job.projectName}": {Math.round(job.progress * 100)}%
          </span>
          <button
            type="button"
            onClick={cancelExport}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-black/10"
          >
            <OctagonX size={14} />
            Cancel
          </button>
        </>
      ) : (
        <>
          <span>Exported "{job.projectName}"</span>
          <button
            type="button"
            onClick={dismissExport}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-black/10"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </>
      )}
    </div>
  )
}
