import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/App/lib/utils'

type ModalProps = {
  title: ReactNode
  onClose: () => void
  headerStart?: ReactNode
  className?: string
  children: ReactNode
}

export function Modal({ title, onClose, headerStart, className, children }: ModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn('flex max-h-full w-full max-w-lg flex-col gap-3 rounded bg-slate-800 p-4 shadow-lg', className)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {headerStart}
            <span className="text-sm font-semibold text-slate-100">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-100 active:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="-mx-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4">{children}</div>
      </div>
    </div>
  )
}
