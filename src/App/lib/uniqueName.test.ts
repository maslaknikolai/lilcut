import { describe, expect, it } from 'vitest'
import { uniqueName } from '@/App/lib/uniqueName'

describe('uniqueName', () => {
  it('keeps a non-colliding name', () => {
    expect(uniqueName('a', [])).toBe('a')
  })

  it('appends a counter on collision', () => {
    expect(uniqueName('Untitled project', ['Untitled project'])).toBe('Untitled project (2)')
  })

  it('counts up an existing counter instead of nesting', () => {
    expect(uniqueName('Untitled project (3)', ['Untitled project (3)'])).toBe('Untitled project (4)')
    expect(uniqueName('Untitled project (3)', ['Untitled project (3)', 'Untitled project (4)'])).toBe(
      'Untitled project (5)',
    )
  })

  it('keeps the counter before the extension', () => {
    expect(uniqueName('video.mp4', ['video.mp4', 'video (2).mp4'])).toBe('video (3).mp4')
    expect(uniqueName('video (2).mp4', ['video (2).mp4'])).toBe('video (3).mp4')
  })

  it('does not grow another group on legacy nested names', () => {
    expect(uniqueName('a (3) (2)', ['a (3) (2)'])).toBe('a (3) (3)')
  })
})
