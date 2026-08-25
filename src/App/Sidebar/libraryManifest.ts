import { migrateProjects } from '@/App/lib/library'
import type { Project } from '@/App/lib/types'

export type LibraryManifest = {
  version: number
  projects: Project[]
  libraryOrder: string[]
}

export type RawManifest = Partial<LibraryManifest>

export const MANIFEST_NAME = 'library.json'

export const MANIFEST_VERSION = 2

export function migrateManifest(raw: RawManifest): LibraryManifest | null {
  const version = raw.version ?? 1
  if (version > MANIFEST_VERSION) {
    return null
  }

  // future upgrades, oldest first:
  let projects = raw.projects ?? []
  if (version < 2) {
    projects = migrateProjects(projects)
  }

  return {
    version: MANIFEST_VERSION,
    projects,
    libraryOrder: raw.libraryOrder ?? [],
  }
}
