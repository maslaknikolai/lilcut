import { useAtomValue, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { mediaAssetsAtom, projectsAtom } from './atoms'
import { ClipsPlayer } from './ClipsPlayer'
import { ProjectActions } from './ProjectActions'
import { PageTitleField } from './PageTitleField'
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
    <div className="flex min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden bg-blue-950/50 pt-10 md:pt-0">
      <div className="flex items-center gap-2 p-4">
        <PageTitleField
          key={project.id}
          label="Project"
          icon={
            <Scissors
              size={16}
              className="shrink-0 text-blue-500"
            />
          }
          initialValue={project.name}
          onChange={renameProject}
        />

        <div className="flex items-center gap-1 pt-8 self-start">
          <ProjectActions project={project} />
        </div>
      </div>

      <ClipsPlayer
        project={project}
        mediaAssets={mediaAssets}
      />
    </div>
  )
}
