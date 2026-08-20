import { useEffect, useEffectEvent, useRef } from 'react'

export function useScrollCurrentIntoView(isCurrent: boolean) {
  const rootRef = useRef<HTMLDivElement>(null)

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
