import { useState } from 'react'
import { ClipItem } from './ClipItem'
import { ClipPreview } from './ClipPreview'
import type { Project } from './types'

type ProjectEditorProps = {
  project: Project
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const [selectedClipId, setSelectedClipId] = useState(project.clips[0]?.id ?? null)
  const selectedClip = project.clips.find((clip) => clip.id === selectedClipId)

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col border-b border-neutral-300">
        <div className="border-b border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase">
          Preview
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          {selectedClip ? (
            <ClipPreview clip={selectedClip} />
          ) : (
            <span className="text-neutral-600">No clips yet</span>
          )}
        </div>
      </div>

      <div className="flex h-48 shrink-0 flex-col">
        <div className="border-b border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase">
          Clips
        </div>
        <ul className="flex-1 overflow-y-auto">
          {project.clips.map((clip) => (
            <ClipItem
              key={clip.id}
              clip={clip}
              isSelected={clip.id === selectedClipId}
              onSelect={() => setSelectedClipId(clip.id)}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
