import { useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { projectsAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { updateProject } from '@/App/lib/library'
import { type TimelineClip } from '@/App/lib/projectTimeline'
import type { Project } from '@/App/lib/types'
import { useKeyPress } from '@/App/lib/useKeyPress'

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
    !!currentTimelineClip && cutMediaTime > currentTimelineClip.cutStart && cutMediaTime < currentTimelineClip.cutEnd

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
    <GhostButton
      onClick={cutHere}
      disabled={!isCutPossible}
      className="shrink-0 px-2"
    >
      <Scissors
        size={14}
        className="text-slate-100"
      />
      Cut Here
      <kbd className="hidden rounded border border-slate-700 px-1 text-[10px] text-slate-500 md:inline">C</kbd>
    </GhostButton>
  )
}
