import { useAtom } from 'jotai'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSidebarOpenAtom } from './atoms'

// mobile-only floating button; the md+ layout shows the sidebar permanently
export function OpenSidebarButton() {
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(isSidebarOpenAtom)

  return (
    <button
      type="button"
      onClick={() => setIsSidebarOpen(true)}
      aria-label="Open sidebar"
      aria-expanded={isSidebarOpen}
      className={cn(
        'fixed z-20 cursor-pointer rounded-full border border-slate-700 bg-slate-900/80 p-3 text-slate-300 shadow-lg backdrop-blur transition-all active:bg-slate-800 md:hidden',
        'bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-[max(0.5rem,env(safe-area-inset-left))]',
        isSidebarOpen && 'pointer-events-none scale-75 opacity-0',
      )}
    >
      <Menu size={20} />
    </button>
  )
}
