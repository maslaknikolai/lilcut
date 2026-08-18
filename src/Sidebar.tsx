import type { ReactNode } from 'react'

type SidebarProps = {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return <div className="flex w-80 shrink-0 flex-col border-r border-neutral-300">{children}</div>
}
