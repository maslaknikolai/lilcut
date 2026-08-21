import { useSetAtom } from 'jotai'
import { CircleHelp } from 'lucide-react'
import { activeModalAtom } from './atoms'

export function HelpButton() {
  const setActiveModal = useSetAtom(activeModalAtom)

  return (
    <button
      type="button"
      onClick={() => setActiveModal({ type: 'help' })}
      className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-900 hover:text-slate-200"
      aria-label="Help"
    >
      <CircleHelp size={16} />
    </button>
  )
}
