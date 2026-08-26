import { useEffectEvent, useLayoutEffect, type RefObject } from 'react'

// runs onResize whenever the element's box changes — window resizes included
export function useOnResize(ref: RefObject<HTMLElement | null>, onResize: () => void) {
  const handleResize = useEffectEvent(() => onResize())

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    const observer = new ResizeObserver(() => handleResize())
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
}
