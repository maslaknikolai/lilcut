// File System Access API: in Chrome, not yet in TS's DOM lib
interface Window {
  showSaveFilePicker(options?: {
    suggestedName?: string
    types?: { description?: string; accept: Record<string, string[]> }[]
  }): Promise<FileSystemFileHandle>
}
