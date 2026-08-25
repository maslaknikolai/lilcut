import { describe, expect, it } from 'vitest'
import { MANIFEST_VERSION, migrateManifest } from '@/App/Sidebar/libraryManifest'
import type { Project } from '@/App/lib/types'

describe('migrateManifest', () => {
  it('rejects a manifest from a newer app version', () => {
    expect(migrateManifest({ version: MANIFEST_VERSION + 1 })).toBeNull()
  })

  it('fills missing fields with empty defaults', () => {
    expect(migrateManifest({})).toEqual({ version: MANIFEST_VERSION, projects: [], libraryOrder: [] })
  })

  it('renames legacy mediaAssetOpfsName clips to videoOpfsName', () => {
    const legacyProject = {
      id: 'p1',
      name: 'p',
      clips: [{ id: 'c1', mediaAssetOpfsName: 'a.mp4', cutStart: 1 }],
    } as unknown as Project
    const migrated = migrateManifest({ version: 1, projects: [legacyProject] })
    expect(migrated?.projects[0].clips).toEqual([{ id: 'c1', videoOpfsName: 'a.mp4', cutStart: 1 }])
  })

  it('passes a current manifest through and stamps the version', () => {
    const projects = [{ id: 'p1', name: 'My project', clips: [] }]
    const libraryOrder = ['p1', 'a.mp4']
    expect(migrateManifest({ version: MANIFEST_VERSION, projects, libraryOrder })).toEqual({
      version: MANIFEST_VERSION,
      projects,
      libraryOrder,
    })
  })
})
