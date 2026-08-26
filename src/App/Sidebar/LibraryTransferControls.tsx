import { useRef, type ChangeEvent } from 'react'
import { useAtomValue } from 'jotai'
import { FolderDown, FolderUp, Trash2 } from 'lucide-react'
import { cn } from '@/App/lib/utils'
import { GhostButton } from '@/App/lib/GhostButton'
import { videosAtom, projectsAtom } from '@/App/atoms'
import { useClearLibrary } from '@/App/Sidebar/useClearLibrary'
import { useExportLibrary } from '@/App/Sidebar/useExportLibrary'
import { useImportLibrary } from '@/App/Sidebar/useImportLibrary'

export function LibraryTransferControls() {
  const videos = useAtomValue(videosAtom)
  const projects = useAtomValue(projectsAtom)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { exportLibrary, isExporting } = useExportLibrary()
  const { importLibrary, isImporting } = useImportLibrary()
  const { clearLibrary, isClearing } = useClearLibrary()

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const zipFile = event.target.files?.[0]
    event.target.value = ''
    if (zipFile) {
      importLibrary(zipFile)
    }
  }

  const isTransferring = isExporting || isImporting || isClearing
  const isLibraryEmpty = !videos.length && !projects.length
  const controlClassName = 'flex-1 py-2 text-slate-400 hover:text-slate-200 active:text-slate-100'

  return (
    <div className="flex gap-1">
      <GhostButton
        onClick={exportLibrary}
        disabled={isTransferring || isLibraryEmpty}
        className={controlClassName}
      >
        <FolderDown size={14} />
        Export .zip
      </GhostButton>

      <GhostButton
        onClick={() => fileInputRef.current?.click()}
        disabled={isTransferring}
        className={controlClassName}
      >
        <FolderUp size={14} />
        Import .zip
      </GhostButton>

      <GhostButton
        onClick={clearLibrary}
        disabled={isTransferring || isLibraryEmpty}
        className={cn(controlClassName, 'text-red-400 hover:text-red-300 active:text-red-200')}
      >
        <Trash2 size={14} />
        Clear
      </GhostButton>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
