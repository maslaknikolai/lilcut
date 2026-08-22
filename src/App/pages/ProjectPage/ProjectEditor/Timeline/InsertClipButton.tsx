import { Plus } from 'lucide-react'
import { cn } from '@/App/lib/utils'

type InsertClipButtonProps = {
  onClick: () => void
  className?: string
}

export function InsertClipButton({ onClick, className }: InsertClipButtonProps) {
  return (
    <div className="relative z-10 w-0 shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={cn(
          'absolute inset-y-1 -left-3 flex w-6 cursor-pointer items-center justify-center rounded bg-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 active:bg-slate-500',
          className,
        )}
        aria-label="Add clip here"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
