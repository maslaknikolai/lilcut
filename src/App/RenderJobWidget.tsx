import { FilePlay, OctagonX, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRenderJobContext } from '@/App/contexts/useRenderJobContext'

export function RenderJobWidget() {
  const { job, cancelRender, dismissRender } = useRenderJobContext()

  if (job.status === 'idle') {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">
      {job.status === 'rendering' ? (
        <>
          <span>
            Rendering "{job.projectName}": {Math.round(job.progress * 100)}%
          </span>
          <button
            type="button"
            onClick={cancelRender}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-black/10 active:bg-black/20"
          >
            <OctagonX size={14} />
            Cancel
          </button>
        </>
      ) : (
        <>
          <Link
            to={`/${encodeURIComponent(job.renderedOpfsName)}`}
            onClick={dismissRender}
            className="flex items-center gap-1.5 hover:underline"
          >
            <FilePlay
              size={14}
              className="shrink-0 text-violet-500"
            />
            {job.renderedOpfsName}
          </Link>
          <button
            type="button"
            onClick={dismissRender}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-black/10 active:bg-black/20"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </>
      )}
    </div>
  )
}
