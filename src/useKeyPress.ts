import { useEffect, useEffectEvent } from 'react'

// global keyboard shortcut that stands down while the key belongs to a
// focused control (typing in inputs, activating buttons, the <video> itself)
export function useKeyPress(code: string, onPress: (event: KeyboardEvent) => void) {
  const handleKeyPress = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== code) {
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

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyPress(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [code])
}
