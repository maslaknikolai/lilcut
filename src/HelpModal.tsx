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
            <b>Get footage</b> — record your screen or upload video files. Everything lands in the library on the
            left and is stored locally in your browser; nothing is uploaded anywhere.
          </p>
          <p>
            <b>Cut</b> — create a project and add clips: each clip plays a range of one file. Hover a clip on the
            timeline for move/edit/clone/remove controls, or press "Cut here" while playing to split at the
            playhead.
          </p>
          <p>
            <b>Timeline</b> — drag to pan, wheel to zoom, click the bar above the clips to seek.
          </p>
          <p>
            <b>Export</b> — "Export mp4" renders the project to a new file in the library. A green dot means the
            clips share formats and export copies streams losslessly; amber means mixed formats and the clips get
            re-encoded.
          </p>
          <p>
            <b>Back up</b> — Export/Import in the sidebar footer moves the whole library (videos + projects) as a
            single zip between browsers or machines.
          </p>
        </div>
      </div>
    </div>
  )
}
