import { useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { projectsAtom } from './atoms'
import { updateProject } from './library'
import { type TimelineClip } from './projectTimeline'
import type { Project } from './types'
import { useKeyPress } from './useKeyPress'

type ProjectPreviewProps = {
  project: Project
  projectTime: number
  currentTimelineClip: TimelineClip | undefined
}

export function CutHereButton({ project, projectTime, currentTimelineClip }: ProjectPreviewProps) {
  const setProjects = useSetAtom(projectsAtom)

  const cutMediaTime = currentTimelineClip
    ? currentTimelineClip.cutStart + (projectTime - currentTimelineClip.projectStart)
    : 0
  const isCutPossible =
    currentTimelineClip !== undefined &&
    cutMediaTime > currentTimelineClip.cutStart &&
    cutMediaTime < currentTimelineClip.cutEnd

  function cutHere() {
    if (!currentTimelineClip || !isCutPossible) {
      return
    }

    setProjects((prev) =>
      updateProject(prev, project.id, (p) => {
        const clipIndex = p.clips.findIndex((clip) => clip.id === currentTimelineClip.id)
        if (clipIndex === -1) {
          return p
        }
        const clip = p.clips[clipIndex]
        // fragment2.cutStart === fragment1.cutEnd, so buildPlaybackClips merges
        // them back into one seamless span until either edge is edited
        const fragment1 = { ...clip, cutEnd: cutMediaTime }
        const fragment2 = {
          ...clip,
          id: crypto.randomUUID(),
          cutStart: cutMediaTime,
          cutEnd: currentTimelineClip.cutEnd,
        }
        const clips = [...p.clips]
        clips.splice(clipIndex, 1, fragment1, fragment2)
        return { ...p, clips }
      }),
    )
  }

  useKeyPress('KeyC', cutHere)

  return (
    <button
      type="button"
      onClick={cutHere}
      disabled={!isCutPossible}
      className="touch-target flex shrink-0 cursor-pointer items-center gap-1 rounded p-1.5 text-xs text-slate-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Scissors size={14} />
      Cut Here
      <kbd className="rounded border border-slate-700 px-1 text-[10px] text-slate-500">C</kbd>
    </button>
  )
}
