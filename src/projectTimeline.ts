import type { MediaAsset, Project } from './types'

export type TimelineClip = {
  id: string
  mediaAssetOpfsName: string
  cutStart: number
  cutEnd: number
  duration: number
  projectStart: number
}

export function buildTimeline(project: Project, mediaAssets: MediaAsset[]): TimelineClip[] {
  let projectStart = 0

  return project.clips.map((clip) => {
    const cutStart = clip.cutStart ?? 0
    const mediaAsset = mediaAssets.find((asset) => asset.opfsName === clip.mediaAssetOpfsName)
    const cutEnd = clip.cutEnd ?? mediaAsset?.duration ?? cutStart
    const clipDuration = Math.max(0, cutEnd - cutStart)
    const timelineClip = {
      id: clip.id,
      mediaAssetOpfsName: clip.mediaAssetOpfsName,
      cutStart,
      cutEnd,
      duration: clipDuration,
      projectStart,
    }

    projectStart += clipDuration
    return timelineClip
  })
}

export function findClipIndexAtTime(timeline: TimelineClip[], time: number): number {
  for (let i = 0; i < timeline.length; i++) {
    if (time < timeline[i].projectStart + timeline[i].duration) {
      return i
    }
  }
  return Math.max(0, timeline.length - 1)
}
