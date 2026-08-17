export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const wholeSeconds = Math.floor(seconds % 60)
  return `${minutes}:${String(wholeSeconds).padStart(2, '0')}`
}
