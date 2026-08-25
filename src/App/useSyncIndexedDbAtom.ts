import { useEffect, useEffectEvent, useState } from 'react'
import { useAtom, type PrimitiveAtom } from 'jotai'
import { idbGet, idbSet } from '@/App/lib/indexedDb'

// loads `key` from the IndexedDB kv store into `valueAtom` on mount, then
// persists every subsequent change back to that key
export function useSyncIndexedDbAtom<T>(valueAtom: PrimitiveAtom<T>, key: string, migrate?: (stored: T) => T) {
  const [value, setValue] = useAtom(valueAtom)
  const [isLoaded, setIsLoaded] = useState(false)

  const load = useEffectEvent(() => {
    idbGet<T>(key).then((stored) => {
      if (stored !== undefined) {
        setValue(migrate ? migrate(stored) : stored)
      }
      setIsLoaded(true)
    })
  })

  useEffect(() => {
    load()
  }, [])

  const persist = useEffectEvent(() => {
    if (isLoaded) {
      idbSet(key, value)
    }
  })

  useEffect(() => {
    persist()
  }, [value, isLoaded])

  return [value, setValue] as const
}
