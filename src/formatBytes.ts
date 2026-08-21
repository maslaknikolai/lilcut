export function formatBytes(bytes: number): string {
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
