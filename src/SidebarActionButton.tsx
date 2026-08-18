import type { ReactNode } from 'react'

type SidebarActionButtonProps = {
  onClick: () => void
  className: string
  children: ReactNode
}

export function SidebarActionButton({ onClick, className, children }: SidebarActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded border border-transparent p-1 text-sm font-medium ${className}`}
    >
      {children}
    </button>
  )
}
