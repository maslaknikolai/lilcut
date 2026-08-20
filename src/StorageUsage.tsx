import { useEffect, useEffectEvent, useState } from 'react'
import { useAtomValue } from 'jotai'
import { mediaAssetsAtom } from './atoms'

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  const isWholeUnit = unitIndex === 0 || value >= 10
  return `${value.toFixed(isWholeUnit ? 0 : 1)} ${units[unitIndex]}`
}

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
      <span className="text-xs text-neutral-500">
        {formatBytes(storageEstimate.usage)} used / {formatBytes(available)} available
      </span>
      <div className="h-1 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-neutral-600"
          style={{ width: `${Math.min(100, usedRatio * 100)}%` }}
        />
      </div>
    </div>
  )
}
