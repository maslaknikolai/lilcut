import type { Project } from './types'

export type LibraryManifest = {
  version: number
  projects: Project[]
  libraryOrder: string[]
}

export type RawManifest = Partial<LibraryManifest>

export const MANIFEST_NAME = 'library.json'

export const MANIFEST_VERSION = 1

export function migrateManifest(raw: RawManifest): LibraryManifest | null {
  const version = raw.version ?? 1
  if (version > MANIFEST_VERSION) {
    return null
  }

  // future upgrades, oldest first:
  // if (version < 2) { ... }

  return {
    version: MANIFEST_VERSION,
    projects: raw.projects ?? [],
    libraryOrder: raw.libraryOrder ?? [],
  }
}
