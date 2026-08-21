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
          <p>
            lilcut is a simple serverless video editing app. It heavily utilizes OPFS: everything is stored on your
            computer, inside the browser — nothing is ever uploaded anywhere, though it also means files have to be
            added to the app locally.
          </p>
        </div>
      </div>
    </div>
  )
}
