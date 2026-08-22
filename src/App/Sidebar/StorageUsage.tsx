import { useEffect, useEffectEvent, useState } from 'react'
import { useAtomValue } from 'jotai'
import { mediaAssetsAtom } from '@/App/atoms'
import { formatBytes } from '@/App/lib/formatBytes'

export function StorageUsage() {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimate | null>(null)

  const refreshStorageEstimate = useEffectEvent(async () => {
    const estimate = await navigator.storage.estimate()
    setStorageEstimate(estimate)
  })

  useEffect(() => {
    refreshStorageEstimate()
  }, [mediaAssets])

  if (storageEstimate?.usage === undefined || storageEstimate.quota === undefined) {
    return null
  }

  const available = storageEstimate.quota - storageEstimate.usage
  const usedRatio = storageEstimate.quota > 0 ? storageEstimate.usage / storageEstimate.quota : 0

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500">
        {formatBytes(storageEstimate.usage)} used / {formatBytes(available)} available
      </span>
      <div className="h-1 overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-slate-400"
          style={{ width: `${Math.min(100, usedRatio * 100)}%` }}
        />
      </div>
    </div>
  )
}
