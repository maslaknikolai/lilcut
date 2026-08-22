import { describe, expect, it } from 'vitest'
import { MANIFEST_VERSION, migrateManifest } from '@/App/Sidebar/libraryManifest'

describe('migrateManifest', () => {
  it('rejects a manifest from a newer app version', () => {
    expect(migrateManifest({ version: MANIFEST_VERSION + 1 })).toBeNull()
  })

  it('fills missing fields with empty defaults', () => {
    expect(migrateManifest({})).toEqual({ version: MANIFEST_VERSION, projects: [], libraryOrder: [] })
  })

  it('passes a current manifest through and stamps the version', () => {
    const projects = [{ id: 'p1', name: 'My project', clips: [] }]
    const libraryOrder = ['p1', 'a.mp4']
    expect(migrateManifest({ version: 1, projects, libraryOrder })).toEqual({
      version: MANIFEST_VERSION,
      projects,
      libraryOrder,
    })
  })
})
