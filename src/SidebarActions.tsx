import type { ReactNode } from 'react'

type SidebarActionsProps = {
  children: ReactNode
}

export function SidebarActions({ children }: SidebarActionsProps) {
  return <div className="flex items-center gap-1 border-b border-neutral-300 p-2">{children}</div>
}
