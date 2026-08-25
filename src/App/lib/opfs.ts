import { uniqueName } from '@/App/lib/uniqueName'
import type { Video } from '@/App/lib/types'

export async function createOpfsWritable(name: string): Promise<FileSystemWritableFileStream> {
  const root = await navigator.storage.getDirectory()
  const handle = await root.getFileHandle(name, { create: true })
  return handle.createWritable()
}

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

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error(`failed to read duration for ${file.name}`))
    }
    video.src = URL.createObjectURL(file)
  })
}

export async function listOpfsVideos(): Promise<Video[]> {
  const root = await navigator.storage.getDirectory()
  const videos: Video[] = []
  for await (const handle of root.values()) {
    if (handle.kind !== 'file') {
      continue
    }
    const file = await handle.getFile()
    const duration = await readVideoDuration(file)
    videos.push({ opfsName: handle.name, mimeType: file.type, duration, size: file.size })
  }
  return videos
}

// FileSystemHandle.move() exists in Chrome but isn't in TS's DOM lib
type MovableFileHandle = FileSystemFileHandle & { move(newName: string): Promise<void> }

export async function renameOpfsFile(oldName: string, newName: string): Promise<void> {
  const root = await navigator.storage.getDirectory()
  const handle = await root.getFileHandle(oldName)
  await (handle as MovableFileHandle).move(newName)
}

export function uniqueOpfsName(desiredName: string, videos: Video[]): string {
  return uniqueName(
    desiredName,
    videos.map((video) => video.opfsName),
  )
}
