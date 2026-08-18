import { uniqueName } from './uniqueName'
import type { MediaFile } from './types'

export async function writeOpfsFile(name: string, blob: Blob): Promise<void> {
  const root = await navigator.storage.getDirectory()
  const handle = await root.getFileHandle(name, { create: true })
  const writable = await handle.createWritable()
  await writable.write(blob)
  await writable.close()
}

export async function readOpfsFile(name: string): Promise<File> {
  const root = await navigator.storage.getDirectory()
  const handle = await root.getFileHandle(name)
  return handle.getFile()
}

export async function deleteOpfsFile(name: string): Promise<void> {
  const root = await navigator.storage.getDirectory()
  await root.removeEntry(name)
}

// FileSystemHandle.move() exists in Chrome but isn't in TS's DOM lib
type MovableFileHandle = FileSystemFileHandle & { move(newName: string): Promise<void> }

export async function renameOpfsFile(oldName: string, newName: string): Promise<void> {
  const root = await navigator.storage.getDirectory()
  const handle = await root.getFileHandle(oldName)
  await (handle as MovableFileHandle).move(newName)
}

export function uniqueOpfsName(desiredName: string, mediaFiles: MediaFile[]): string {
  return uniqueName(
    desiredName,
    mediaFiles.map((file) => file.opfsName),
  )
}
