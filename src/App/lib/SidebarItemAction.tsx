import type { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/App/lib/ui/tooltip'
import { cn } from '@/App/lib/utils'

type SidebarItemActionProps = {
  onClick: () => void
  label: string
  tooltip?: string
  className?: string
  onBlur?: () => void
  children: ReactNode
}

export function SidebarItemAction({ onClick, label, tooltip, className, onBlur, children }: SidebarItemActionProps) {
  const button = (
    <button
      type="button"
      onClick={(e) => {
        // the row selects on click — an action must not also select
        e.stopPropagation()
        onClick()
      }}
      onBlur={onBlur}
      aria-label={label}
      className={cn(
        'flex min-h-10 min-w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-100 active:text-white',
        className,
      )}
    >
      {children}
    </button>
  )

  if (!tooltip) {
    return button
  }

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
