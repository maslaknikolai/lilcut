import type { Clip, Video } from '@/App/lib/types'

// cutEnd === undefined means "to the end of the video" (0 is a real time)
export function isClipRangeValid(clip: Clip): boolean {
  return clip.cutEnd === undefined || clip.cutEnd > (clip.cutStart ?? 0)
}

// the default clip: plays its video from start to end
export function makeFullClip(opfsName: string): Clip {
  return { id: crypto.randomUUID(), videoOpfsName: opfsName, cutStart: 0 }
}

export function isDefaultClip(clip: Clip): boolean {
  const hasDefaultStart = !(clip.cutStart ?? 0)
  return hasDefaultStart && clip.cutEnd === undefined
}

export type TimelineClip = {
  id: string
  videoOpfsName: string
  cutStart: number
  cutEnd: number
  duration: number
  projectStart: number
}

export const EMPTY_CLIP_WIDTH = 40

export function getTimelineClipWidth(duration: number, pxPerSecond: number): number {
  return duration ? duration * pxPerSecond : EMPTY_CLIP_WIDTH
}

// the clip row separates its children by a 1px flex gap; the insert buttons
// between clips are zero-width, so only the gaps shift the clips along
const CLIP_GAP = 1
const FIRST_CLIP_LEFT = CLIP_GAP
const GAP_BETWEEN_CLIPS = 2 * CLIP_GAP

// empty clips keep a fixed pixel width, so time and pixels don't scale
// together — walk the row to place the playhead where its clip really is
export function getTimelineX(timelineClips: TimelineClip[], time: number, pxPerSecond: number): number {
  let left = FIRST_CLIP_LEFT

  for (const timelineClip of timelineClips) {
    const isInsideClip = time < timelineClip.projectStart + timelineClip.duration
    // an empty clip spans no time, so only its own start point hits it
    const isAtClipStart = time === timelineClip.projectStart
    if (isInsideClip || isAtClipStart) {
      return left + (time - timelineClip.projectStart) * pxPerSecond
    }
    left += getTimelineClipWidth(timelineClip.duration, pxPerSecond) + GAP_BETWEEN_CLIPS
  }

  return Math.max(FIRST_CLIP_LEFT, left - GAP_BETWEEN_CLIPS)
}

// inverse of getTimelineX: a click at x on the row becomes a project time
export function getTimelineTime(timelineClips: TimelineClip[], x: number, pxPerSecond: number): number {
  let left = FIRST_CLIP_LEFT

  for (const timelineClip of timelineClips) {
    const width = getTimelineClipWidth(timelineClip.duration, pxPerSecond)
    if (x < left + width) {
      const timeIntoClip = timelineClip.duration ? (x - left) / pxPerSecond : 0
      const clampedTimeIntoClip = Math.max(0, Math.min(timelineClip.duration, timeIntoClip))
      return timelineClip.projectStart + clampedTimeIntoClip
    }
    left += width + GAP_BETWEEN_CLIPS
  }

  const lastTimelineClip = timelineClips.at(-1)
  return lastTimelineClip ? lastTimelineClip.projectStart + lastTimelineClip.duration : 0
}

export function buildTimelineClips(clips: Clip[], videos: Video[]): TimelineClip[] {
  let projectStart = 0

  return clips.map((clip) => {
    const cutStart = clip.cutStart ?? 0
    const video = videos.find((asset) => asset.opfsName === clip.videoOpfsName)
    const cutEnd = clip.cutEnd ?? video?.duration ?? cutStart
    const clipDuration = Math.max(0, cutEnd - cutStart)
    const timelineClip = {
      id: clip.id,
      videoOpfsName: clip.videoOpfsName,
      cutStart,
      cutEnd,
      duration: clipDuration,
      projectStart,
    }

    projectStart += clipDuration
    return timelineClip
  })
}

// a timeline clip merged with any following clips that continue the same file
// exactly where the previous one ended (a split, not a cut) — such spans play
// and export as one solid span, no seek or cut at the boundary
export type PlaybackClip = TimelineClip

export function buildPlaybackClips(timelineClips: TimelineClip[]): PlaybackClip[] {
  const playbackClips: PlaybackClip[] = []

  for (const timelineClip of timelineClips) {
    const previousPlaybackClip = playbackClips[playbackClips.length - 1]
    const isContinuation =
      !!previousPlaybackClip &&
      previousPlaybackClip.videoOpfsName === timelineClip.videoOpfsName &&
      previousPlaybackClip.cutEnd === timelineClip.cutStart

    if (isContinuation) {
      previousPlaybackClip.cutEnd = timelineClip.cutEnd
      previousPlaybackClip.duration += timelineClip.duration
    } else {
      playbackClips.push({ ...timelineClip })
    }
  }

  return playbackClips
}

export function findClipIndexAtTime(clips: TimelineClip[], time: number): number {
  for (let i = 0; i < clips.length; i++) {
    if (time < clips[i].projectStart + clips[i].duration) {
      return i
    }
  }
  return Math.max(0, clips.length - 1)
}
