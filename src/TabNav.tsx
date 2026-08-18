import { FolderKanban, Film } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ExportJobWidget } from './ExportJobWidget'

function getTabClassName({ isActive }: { isActive: boolean }) {
  const activeClassName = isActive
    ? 'border-neutral-900 text-neutral-900'
    : 'border-transparent text-neutral-500 hover:text-neutral-900'
  return `flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium ${activeClassName}`
}

export function TabNav() {
  return (
    <nav className="flex items-center justify-between border-b border-neutral-300 pr-2">
      <div className="flex">
        <NavLink
          to="/"
          end
          className={getTabClassName}
        >
          <FolderKanban className="size-4" />
          Projects
        </NavLink>
        <NavLink
          to="/files"
          className={getTabClassName}
        >
          <Film className="size-4" />
          Files
        </NavLink>
      </div>

      <ExportJobWidget />
    </nav>
  )
}
