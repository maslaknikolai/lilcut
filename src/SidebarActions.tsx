import type { ReactNode } from 'react'

type SidebarActionsProps = {
  children: ReactNode
}

export function SidebarActions({ children }: SidebarActionsProps) {
  return <div className="flex border-b border-neutral-300 p-2 gap-1">{children}</div>
}
