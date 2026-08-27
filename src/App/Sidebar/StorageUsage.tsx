import { useEffect, useEffectEvent, useState } from 'react'
import { useAtomValue } from 'jotai'
import { videosAtom } from '@/App/atoms'
import { formatBytes } from '@/App/lib/formatBytes'

function useStorageUsage() {
  const videos = useAtomValue(videosAtom)
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimate | null>(null)

  const refreshStorageEstimate = useEffectEvent(async () => {
    const estimate = await navigator.storage.estimate()
    setStorageEstimate(estimate)
  })

  useEffect(() => {
    refreshStorageEstimate()
  }, [videos])

  if (storageEstimate?.usage === undefined || storageEstimate.quota === undefined) {
    return null
  }

  const { usage, quota } = storageEstimate
  return {
    usage,
    available: quota - usage,
    usedRatio: quota > 0 ? usage / quota : 0,
  }
}

export function StorageUsageText() {
  const storageUsage = useStorageUsage()

  if (!storageUsage) {
    return null
  }

  return (
    <span className="text-xs text-nowrap text-slate-500">
      {formatBytes(storageUsage.usage)} used / {formatBytes(storageUsage.available)} available
    </span>
  )
}
