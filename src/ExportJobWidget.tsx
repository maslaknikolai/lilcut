import { X } from 'lucide-react'
import { useExportJobContext } from './useExportJobContext'

export function ExportJobWidget() {
  const { isExporting, exportProgress, cancelExport } = useExportJobContext()

  if (!isExporting) {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded bg-neutral-900 px-3 py-1 text-sm font-medium text-white">
      <span>Export: {Math.round(exportProgress * 100)}%</span>

      <button
        type="button"
        onClick={cancelExport}
        className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10"
      >
        <X size={14} />
        Cancel
      </button>
    </div>
  )
}
