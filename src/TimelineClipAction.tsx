import type { ReactNode } from 'react'

type TimelineClipActionProps = {
  onClick: () => void
  label: string
  disabled?: boolean
  children: ReactNode
}

export function TimelineClipAction({ onClick, label, disabled, children }: TimelineClipActionProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      // ponytail: native title instead of Radix Tooltip — a nested Radix
      // tooltip force-closes the toolbar tooltip it lives in (one open globally)
      title={label}
      className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded hover:bg-white/20 focus-visible:bg-white/20 active:bg-white/30 disabled:hidden"
      aria-label={label}
    >
      {children}
    </button>
  )
}
