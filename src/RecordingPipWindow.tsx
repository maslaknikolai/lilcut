import { useEffect, useEffectEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { Square } from 'lucide-react'
import { useScreenRecordingContext } from './useScreenRecordingContext'

function copyStylesInto(pipDocument: Document) {
  for (const sheet of document.styleSheets) {
    const style = pipDocument.createElement('style')
    style.textContent = [...sheet.cssRules].map((rule) => rule.cssText).join('\n')
    pipDocument.head.appendChild(style)
  }
}

export function RecordingPipWindow() {
  const { isRecording, stop } = useScreenRecordingContext()
  const [pipWindow, setPipWindow] = useState<Window | null>(null)

  const syncPipWindow = useEffectEvent(async () => {
    if (!isRecording) {
      pipWindow?.close()
      setPipWindow(null)
      return
    }

    if (!window.documentPictureInPicture) {
      return
    }
    const pip = await window.documentPictureInPicture.requestWindow({ width: 220, height: 72 })
    copyStylesInto(pip.document)
    pip.addEventListener('pagehide', () => setPipWindow(null))
    setPipWindow(pip)
  })

  useEffect(() => {
    syncPipWindow()
  }, [isRecording])

  if (!pipWindow) {
    return null
  }

  return createPortal(
    <button
      type="button"
      onClick={stop}
      className="m-2 flex items-center justify-center gap-1.5 rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800"
    >
      <Square size={14} fill="currentColor" /> Stop recording
    </button>,
    pipWindow.document.body,
  )
}
