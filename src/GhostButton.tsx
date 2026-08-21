import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function GhostButton({ className, type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'touch-target flex cursor-pointer py-2 px-1 items-center justify-center gap-1.5 rounded border border-slate-700 text-xs text-nowrap text-slate-300 hover:bg-slate-900 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
