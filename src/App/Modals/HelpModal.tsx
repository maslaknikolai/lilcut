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
            className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-100 active:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-sm text-slate-300">
          <section>
            <p>
              LilCut is a simple open-source screen recorder and video editor that runs entirely in your browser. Your
              videos never leave your device.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-medium text-white">How it works</h3>
            <p>
              Record your screen or import videos, trim and rearrange clips, then export the result. Media files are
              stored locally in your browser.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-medium text-white">Privacy & storage</h3>
            <p>
              LilCut doesn't upload your recordings to a server. Clearing browser site data may remove locally stored
              files and projects.
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-medium text-white">Feedback</h3>
            <p>
              Found a bug or have an idea? Email{' '}
              <a
                href="mailto:nikomaslak@gmail.com"
                className="text-blue-400 hover:underline"
              >
                nikomaslak@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
