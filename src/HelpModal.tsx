import { X } from 'lucide-react'

type HelpModalProps = {
  onClose: () => void
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col gap-3 rounded bg-slate-800 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">Help</span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-slate-500 hover:text-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm text-slate-300">
          <p>lilcut is a simple video editor that works entirely in your browser. Your videos stay on your computer.</p>
          <p className="">
            Found a bug or have an idea? Email{' '}
            <a
              href="mailto:nikomaslak@gmail.com"
              className="text-blue-400 hover:underline"
            >
              nikomaslak@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
