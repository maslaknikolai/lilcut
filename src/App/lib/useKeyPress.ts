import { useEffect, useEffectEvent } from 'react'

// global keyboard shortcut that stands down while the key belongs to a
// focused control (typing in inputs, activating buttons, the <video> itself)
type UseKeyPressOptions = {
  // for keys whose handler reads the modifiers itself (Alt+Arrow, Cmd+Arrow)
  isModifierAllowed?: boolean
  // for keys that do something while held (Space runs playback at 2x)
  onRelease?: () => void
}

export function useKeyPress(
  code: string,
  onPress: (event: KeyboardEvent) => void,
  { isModifierAllowed, onRelease }: UseKeyPressOptions = {},
) {
  const handleKeyPress = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== code) {
      return
    }
    // leave browser/OS combos (Cmd+C, Ctrl+ArrowLeft, …) alone
    if (!isModifierAllowed && (event.metaKey || event.ctrlKey || event.altKey)) {
      return
    }
    const target = event.target instanceof HTMLElement ? event.target : null
    if (target?.closest('input, textarea, select, button, video, [contenteditable]')) {
      return
    }
    // keep the key's default (page scroll, caret move) out of the way
    event.preventDefault()
    onPress(event)
  })

  const handleKeyRelease = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== code) {
      return
    }
    onRelease?.()
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyPress(event)
    const releaseListener = (event: KeyboardEvent) => handleKeyRelease(event)
    window.addEventListener('keydown', listener)
    window.addEventListener('keyup', releaseListener)
    return () => {
      window.removeEventListener('keydown', listener)
      window.removeEventListener('keyup', releaseListener)
    }
  }, [code])
}
