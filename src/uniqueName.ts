// "video.mp4" → "video (2).mp4" → "video (3).mp4"
// "Untitled project (3)" → "Untitled project (4)", never "Untitled project (3) (2)"
export function uniqueName(desiredName: string, existingNames: string[]): string {
  if (!existingNames.includes(desiredName)) {
    return desiredName
  }

  const dotIndex = desiredName.lastIndexOf('.')
  let nameWithoutExtension = dotIndex === -1 ? desiredName : desiredName.slice(0, dotIndex)
  const extension = dotIndex === -1 ? '' : desiredName.slice(dotIndex)

  let attempt = 2
  const counterMatch = nameWithoutExtension.match(/^(.*) \((\d+)\)$/)
  if (counterMatch) {
    nameWithoutExtension = counterMatch[1]
    attempt = Number(counterMatch[2]) + 1
  }

  let candidate = `${nameWithoutExtension} (${attempt})${extension}`
  while (existingNames.includes(candidate)) {
    attempt++
    candidate = `${nameWithoutExtension} (${attempt})${extension}`
  }
  return candidate
}
