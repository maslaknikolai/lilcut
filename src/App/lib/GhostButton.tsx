import type { ComponentProps, ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/App/lib/ui/tooltip'
import { cn } from '@/App/lib/utils'

type GhostButtonProps = ComponentProps<'button'> & {
  tooltip?: ReactNode
}

export function GhostButton({ className, type = 'button', tooltip, ...props }: GhostButtonProps) {
  const button = (
    <button
      type={type}
      className={cn(
        'flex min-h-10 min-w-10 cursor-pointer py-2 px-1 items-center justify-center gap-1.5 rounded border border-slate-700 text-xs text-nowrap text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
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
