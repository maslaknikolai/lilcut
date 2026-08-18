// appends " (2)", " (3)", etc. before the extension (if any) until `desiredName` no longer collides
export function uniqueName(desiredName: string, existingNames: string[]): string {
  if (!existingNames.includes(desiredName)) {
    return desiredName
  }
  const dotIndex = desiredName.lastIndexOf('.')
  const base = dotIndex === -1 ? desiredName : desiredName.slice(0, dotIndex)
  const extension = dotIndex === -1 ? '' : desiredName.slice(dotIndex)
  let attempt = 2
  while (existingNames.includes(`${base} (${attempt})${extension}`)) {
    attempt++
  }
  return `${base} (${attempt})${extension}`
}
