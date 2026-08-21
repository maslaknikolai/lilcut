import { useEffect, useEffectEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { RecordControls } from './RecordControls'
import { useScreenRecordingContext } from './useScreenRecordingContext'

function copyStylesInto(pipDocument: Document) {
  for (const sheet of document.styleSheets) {
    const style = pipDocument.createElement('style')
    style.textContent = [...sheet.cssRules].map((rule) => rule.cssText).join('\n')
    pipDocument.head.appendChild(style)
  }
}

export function RecordingPipWindow() {
  const { recording } = useScreenRecordingContext()
  const isRecording = recording.status !== 'idle'
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
    const pip = await window.documentPictureInPicture.requestWindow({ width: 280, height: 72 })
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
    <div className="flex h-svh items-center justify-center gap-2 p-2">
      <RecordControls />
    </div>,
    pipWindow.document.body,
  )
}
