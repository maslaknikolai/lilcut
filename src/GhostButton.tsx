import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function GhostButton({ className, type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'flex cursor-pointer items-center justify-center gap-1.5 rounded border border-slate-700 p-1 text-xs text-nowrap text-slate-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
