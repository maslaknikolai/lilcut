import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ActionButtonProps = {
  onClick: () => void
  className: string
  children: ReactNode
}

export function ActionButton({ onClick, className, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center justify-center gap-1.5 rounded border border-transparent p-1 text-nowrap text-sm font-medium',
        className,
      )}
    >
      {children}
    </button>
  )
}
