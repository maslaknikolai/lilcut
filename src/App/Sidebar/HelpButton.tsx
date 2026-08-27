import { useSetAtom } from 'jotai'
import { CircleHelp } from 'lucide-react'
import { activeModalAtom, ModalType } from '@/App/atoms'

export function HelpButton() {
  const setActiveModal = useSetAtom(activeModalAtom)

  return (
    <button
      type="button"
      onClick={() => setActiveModal({ type: ModalType.Help })}
      className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-slate-900 hover:text-slate-200 active:bg-slate-950 active:text-slate-100"
      aria-label="Help"
    >
      <CircleHelp size={16} />
    </button>
  )
}
