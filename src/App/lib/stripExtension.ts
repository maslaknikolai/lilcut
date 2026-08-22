export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '')
}
