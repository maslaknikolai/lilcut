import { useSetAtom } from 'jotai'
import { mediaAssetsAtom } from './atoms'
import { deleteOpfsFile, listOpfsMediaAssets, renameOpfsFile, writeOpfsFile } from './opfs'

// wraps the OPFS media-asset mutations so every call site gets the
// mediaAssetsAtom refresh for free, instead of remembering to trigger it
export function useMediaAssetActions() {
  const setMediaAssets = useSetAtom(mediaAssetsAtom)

  async function refresh() {
    setMediaAssets(await listOpfsMediaAssets())
  }

  async function writeMediaAsset(name: string, blob: Blob): Promise<void> {
    await writeOpfsFile(name, blob)
    await refresh()
  }

  async function deleteMediaAsset(name: string): Promise<void> {
    await deleteOpfsFile(name)
    await refresh()
  }

  async function renameMediaAsset(oldName: string, newName: string): Promise<void> {
    await renameOpfsFile(oldName, newName)
    await refresh()
  }

  return { writeMediaAsset, deleteMediaAsset, renameMediaAsset }
}
