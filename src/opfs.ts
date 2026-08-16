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
