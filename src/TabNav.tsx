import { NavLink } from 'react-router-dom'

function getTabClassName({ isActive }: { isActive: boolean }) {
  const activeClassName = isActive
    ? 'border-neutral-900 text-neutral-900'
    : 'border-transparent text-neutral-500 hover:text-neutral-900'
  return `border-b-2 px-4 py-2 text-sm font-medium ${activeClassName}`
}

export function TabNav() {
  return (
    <nav className="flex border-b border-neutral-300">
      <NavLink to="/" end className={getTabClassName}>
        Projects
      </NavLink>
      <NavLink to="/files" className={getTabClassName}>
        Files
      </NavLink>
    </nav>
  )
}
