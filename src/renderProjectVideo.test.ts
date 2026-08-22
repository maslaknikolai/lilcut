import { describe, expect, it } from 'vitest'
import { snapToPrecedingKeyframe } from './renderProjectVideo'

describe('snapToPrecedingKeyframe', () => {
  const keyframeTimes = [0, 2, 4.5, 9]

  it('snaps back to the latest keyframe at or before the time', () => {
    expect(snapToPrecedingKeyframe(4, keyframeTimes)).toBe(2)
    expect(snapToPrecedingKeyframe(100, keyframeTimes)).toBe(9)
  })

  it('a time exactly on a keyframe stays put', () => {
    expect(snapToPrecedingKeyframe(4.5, keyframeTimes)).toBe(4.5)
  })

  it('keeps the requested time without keyframe data', () => {
    expect(snapToPrecedingKeyframe(3, [])).toBe(3)
  })

  it('keeps the requested time before the first keyframe', () => {
    expect(snapToPrecedingKeyframe(1, [2, 4])).toBe(1)
  })
})
