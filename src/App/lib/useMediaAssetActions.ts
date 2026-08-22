import { useSetAtom } from 'jotai'
import { libraryOrderAtom, mediaAssetsAtom } from '@/App/atoms'
import { deleteOpfsFile, listOpfsMediaAssets, renameOpfsFile, writeOpfsFile } from '@/App/lib/opfs'

// wraps the OPFS media-asset mutations so every call site gets the
// mediaAssetsAtom refresh for free, instead of remembering to trigger it
export function useMediaAssetActions() {
  const setMediaAssets = useSetAtom(mediaAssetsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)

  async function refreshMediaAssets() {
    setMediaAssets(await listOpfsMediaAssets())
  }

  async function writeMediaAsset(name: string, blob: Blob): Promise<void> {
    await writeOpfsFile(name, blob)
    await refreshMediaAssets()
  }

  async function deleteMediaAsset(name: string): Promise<void> {
    await deleteOpfsFile(name)
    await refreshMediaAssets()
    setLibraryOrder((prev) => prev.filter((id) => id !== name))
  }

  async function renameMediaAsset(oldName: string, newName: string): Promise<void> {
    await renameOpfsFile(oldName, newName)
    await refreshMediaAssets()
  }

  return { writeMediaAsset, deleteMediaAsset, renameMediaAsset, refreshMediaAssets }
}
