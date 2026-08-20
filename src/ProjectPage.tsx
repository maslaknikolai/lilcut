import { useAtomValue, useSetAtom } from 'jotai'
import { mediaAssetsAtom, projectsAtom } from './atoms'
import { ClipsPlayer } from './ClipsPlayer'
import { ExportProjectButton } from './ExportProjectButton'
import { RenameField } from './RenameField'
import type { Project } from './types'

type ProjectPreviewProps = {
  project: Project
}

export function ProjectPage({ project }: ProjectPreviewProps) {
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const setProjects = useSetAtom(projectsAtom)

  function renameProject(name: string) {
    setProjects((prev) => prev.map((item) => (item.id === project.id ? { ...item, name } : item)))
  }

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex items-center gap-2 p-4">
        <RenameField
          key={project.id}
          initialValue={project.name}
          onCommit={renameProject}
        />

        <ExportProjectButton project={project} />
      </div>

      <ClipsPlayer
        project={project}
        mediaAssets={mediaAssets}
      />
    </div>
  )
}
