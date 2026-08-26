import { Modal } from '@/App/Modals/Modal'

type HelpModalProps = {
  onClose: () => void
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <Modal
      title="Help"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 text-sm text-slate-300">
        <section>
          <p>
            Screen recordings are the most efficient way to explain things — but making them is usually a pain: record,
            open some heavyweight editor with a million features you'll never use, then painstakingly cut out all the
            failed parts. LilCut is a screen recorder + simple video editor built to skip all that.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-medium text-white">How it works</h3>
          <p>
            Start recording and the controls appear on top of other apps, in a Picture-in-Picture window. Messed
            something up? Click pause, collect your thoughts, and resume. When you're done, LilCut saves the recording
            and automatically creates a project with cut points wherever you paused — so most of the editing is already
            done. Delete the failed parts, rearrange the rest, export.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-medium text-white">Privacy & storage</h3>
          <p>
            LilCut is free, open-source, and serverless — it runs entirely in your browser, and recordings are stored
            locally on your device (OPFS), so your videos never leave it. Your videos and projects can be exported, so
            you're free to take them elsewhere. The editor works on mobile too, though recording isn't supported there.
            Clearing browser site data may remove locally stored files and projects.
          </p>
        </section>

        <section>
          <h3 className="mb-1 font-medium text-white">Feedback</h3>
          <p>
            I'd love to hear what you think — what would you use it for, and what features would you want? Email{' '}
            <a
              href="mailto:nikomaslak@gmail.com"
              className="text-blue-400 hover:underline"
            >
              nikomaslak@gmail.com
            </a>
          </p>
        </section>
      </div>
    </Modal>
  )
}
