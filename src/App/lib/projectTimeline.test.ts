import { describe, expect, it } from 'vitest'
import {
  buildPlaybackClips,
  buildTimelineClips,
  findClipIndexAtTime,
  isClipRangeValid,
  isDefaultClip,
  makeFullClip,
} from '@/App/lib/projectTimeline'
import type { Clip, Video, Project } from '@/App/lib/types'

function makeVideo(opfsName: string, duration: number): Video {
  return { opfsName, mimeType: 'video/mp4', duration, size: 0 }
}

function makeProject(clips: Clip[]): Project {
  return { id: 'project-1', name: 'Test project', clips }
}

const videos = [makeVideo('a.mp4', 10), makeVideo('b.mp4', 20)]

describe('buildTimelineClips', () => {
  it('defaults cutStart to 0 and cutEnd to the video duration', () => {
    const project = makeProject([{ id: '1', videoOpfsName: 'a.mp4' }])
    const [timelineClip] = buildTimelineClips(project.clips, videos)
    expect(timelineClip).toMatchObject({ cutStart: 0, cutEnd: 10, duration: 10, projectStart: 0 })
  })

  it('accumulates projectStart across clips', () => {
    const project = makeProject([
      { id: '1', videoOpfsName: 'a.mp4', cutStart: 2, cutEnd: 5 },
      { id: '2', videoOpfsName: 'b.mp4', cutStart: 0, cutEnd: 4 },
    ])
    const timelineClips = buildTimelineClips(project.clips, videos)
    expect(timelineClips[0]).toMatchObject({ duration: 3, projectStart: 0 })
    expect(timelineClips[1]).toMatchObject({ duration: 4, projectStart: 3 })
  })

  it('gives a zero-duration clip for a missing video with open cutEnd', () => {
    const project = makeProject([{ id: '1', videoOpfsName: 'missing.mp4', cutStart: 3 }])
    const [timelineClip] = buildTimelineClips(project.clips, videos)
    expect(timelineClip.duration).toBe(0)
  })

  it('clamps an inverted range to zero duration', () => {
    const project = makeProject([{ id: '1', videoOpfsName: 'a.mp4', cutStart: 5, cutEnd: 3 }])
    const [timelineClip] = buildTimelineClips(project.clips, videos)
    expect(timelineClip.duration).toBe(0)
  })
})

describe('buildPlaybackClips', () => {
  it('merges a split (same file, contiguous range) into one playback clip', () => {
    const project = makeProject([
      { id: '1', videoOpfsName: 'a.mp4', cutStart: 0, cutEnd: 4 },
      { id: '2', videoOpfsName: 'a.mp4', cutStart: 4, cutEnd: 10 },
    ])
    const timelineClips = buildTimelineClips(project.clips, videos)
    const playbackClips = buildPlaybackClips(timelineClips)
    expect(playbackClips).toHaveLength(1)
    expect(playbackClips[0]).toMatchObject({ cutStart: 0, cutEnd: 10, duration: 10 })
  })

  it('does not merge across different files', () => {
    const project = makeProject([
      { id: '1', videoOpfsName: 'a.mp4', cutStart: 0, cutEnd: 4 },
      { id: '2', videoOpfsName: 'b.mp4', cutStart: 4, cutEnd: 10 },
    ])
    const playbackClips = buildPlaybackClips(buildTimelineClips(project.clips, videos))
    expect(playbackClips).toHaveLength(2)
  })

  it('does not merge when the ranges have a gap (a real cut)', () => {
    const project = makeProject([
      { id: '1', videoOpfsName: 'a.mp4', cutStart: 0, cutEnd: 4 },
      { id: '2', videoOpfsName: 'a.mp4', cutStart: 5, cutEnd: 10 },
    ])
    const playbackClips = buildPlaybackClips(buildTimelineClips(project.clips, videos))
    expect(playbackClips).toHaveLength(2)
  })

  it('does not mutate the timeline clips it merges', () => {
    const project = makeProject([
      { id: '1', videoOpfsName: 'a.mp4', cutStart: 0, cutEnd: 4 },
      { id: '2', videoOpfsName: 'a.mp4', cutStart: 4, cutEnd: 10 },
    ])
    const timelineClips = buildTimelineClips(project.clips, videos)
    buildPlaybackClips(timelineClips)
    expect(timelineClips[0]).toMatchObject({ cutEnd: 4, duration: 4 })
  })
})

describe('findClipIndexAtTime', () => {
  const project = makeProject([
    { id: '1', videoOpfsName: 'a.mp4', cutStart: 0, cutEnd: 4 },
    { id: '2', videoOpfsName: 'b.mp4', cutStart: 0, cutEnd: 6 },
  ])
  const timelineClips = buildTimelineClips(project.clips, videos)

  it('finds the clip containing the time', () => {
    expect(findClipIndexAtTime(timelineClips, 1)).toBe(0)
    expect(findClipIndexAtTime(timelineClips, 5)).toBe(1)
  })

  it('a clip boundary belongs to the next clip', () => {
    expect(findClipIndexAtTime(timelineClips, 4)).toBe(1)
  })

  it('clamps past-the-end times to the last clip', () => {
    expect(findClipIndexAtTime(timelineClips, 99)).toBe(1)
  })

  it('returns 0 for an empty timeline', () => {
    expect(findClipIndexAtTime([], 5)).toBe(0)
  })
})

describe('isClipRangeValid', () => {
  it('an open cutEnd (to video end) is always valid', () => {
    expect(isClipRangeValid({ id: '1', videoOpfsName: 'a.mp4', cutStart: 5 })).toBe(true)
  })

  it('cutEnd must be after cutStart', () => {
    expect(isClipRangeValid({ id: '1', videoOpfsName: 'a.mp4', cutStart: 2, cutEnd: 5 })).toBe(true)
    expect(isClipRangeValid({ id: '1', videoOpfsName: 'a.mp4', cutStart: 5, cutEnd: 5 })).toBe(false)
    expect(isClipRangeValid({ id: '1', videoOpfsName: 'a.mp4', cutStart: 5, cutEnd: 3 })).toBe(false)
  })

  it('cutEnd 0 is a real (invalid) time, not "to the end"', () => {
    expect(isClipRangeValid({ id: '1', videoOpfsName: 'a.mp4', cutStart: 0, cutEnd: 0 })).toBe(false)
  })
})

describe('makeFullClip / isDefaultClip', () => {
  it('a full clip is default and covers the whole video', () => {
    const clip = makeFullClip('a.mp4')
    expect(clip.videoOpfsName).toBe('a.mp4')
    expect(clip.cutStart).toBe(0)
    expect(clip.cutEnd).toBeUndefined()
    expect(isDefaultClip(clip)).toBe(true)
  })

  it('every full clip gets its own id', () => {
    expect(makeFullClip('a.mp4').id).not.toBe(makeFullClip('a.mp4').id)
  })

  it('a trimmed clip is not default', () => {
    expect(isDefaultClip({ id: '1', videoOpfsName: 'a.mp4', cutStart: 1 })).toBe(false)
    expect(isDefaultClip({ id: '1', videoOpfsName: 'a.mp4', cutStart: 0, cutEnd: 5 })).toBe(false)
  })

  it('an omitted cutStart counts as 0', () => {
    expect(isDefaultClip({ id: '1', videoOpfsName: 'a.mp4' })).toBe(true)
  })
})
