import { useState } from 'react'
import { useAtom } from 'jotai'
import { projectsAtom } from './atoms'
import { ClipRangeEditor } from './ClipRangeEditor'
import { updateProject } from './library'
import { isClipRangeValid, type TimelineClip } from './projectTimeline'
import type { Clip } from './types'

type ClipEditModalProps = {
  projectId: string
  clip: TimelineClip
  onClose: () => void
}

export function ClipEditModal({ projectId, clip, onClose }: ClipEditModalProps) {
  const [projects, setProjects] = useAtom(projectsAtom)

  const projectClip = projects.find((p) => p.id === projectId)?.clips.find((item) => item.id === clip.id)
  const [draftClip, setDraftClip] = useState(projectClip ?? null)

  if (!draftClip) {
    return null
  }

  function saveClip(savedClip: Clip) {
    setProjects((prev) =>
      updateProject(prev, projectId, (project) => ({
        ...project,
        clips: project.clips.map((item) => (item.id === savedClip.id ? savedClip : item)),
      })),
    )
    onClose()
  }

  return (
    <ClipRangeEditor
      clip={draftClip}
      title="Edit clip"
      onClipChange={setDraftClip}
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 cursor-pointer rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 active:bg-slate-950"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => saveClip(draftClip)}
            disabled={!isClipRangeValid(draftClip)}
            className="min-h-10 cursor-pointer rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </>
      }
    />
  )
}
