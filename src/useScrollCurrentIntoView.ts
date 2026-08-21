import { useEffect, useEffectEvent, useRef } from 'react'

export function useScrollCurrentIntoView<T extends HTMLElement = HTMLDivElement>(isCurrent: boolean) {
  const rootRef = useRef<T>(null)

  const scrollCurrentIntoView = useEffectEvent(() => {
    if (isCurrent) {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  })

  useEffect(() => {
    scrollCurrentIntoView()
  }, [isCurrent])

  return rootRef
}
