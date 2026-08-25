import { useAtomValue, useSetAtom } from 'jotai'
import { Scissors } from 'lucide-react'
import { videosAtom, projectsAtom } from '@/App/atoms'
import { ProjectEditor } from '@/App/pages/ProjectPage/ProjectEditor/ProjectEditor'
import { ProjectActions } from '@/App/lib/ProjectActions'
import { PageTitleField } from '@/App/lib/PageTitleField'
import type { Project } from '@/App/lib/types'

type ProjectPreviewProps = {
  project: Project
}

export function ProjectPage({ project }: ProjectPreviewProps) {
  const videos = useAtomValue(videosAtom)
  const setProjects = useSetAtom(projectsAtom)

  function renameProject(name: string) {
    setProjects((prev) => prev.map((item) => (item.id === project.id ? { ...item, name } : item)))
  }

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col overflow-hidden bg-blue-950/50">
      <div className="flex gap-2 p-4 pl-14 md:pl-4">
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

        <div className="flex items-center gap-1 pt-6 self-start">
          <ProjectActions project={project} />
        </div>
      </div>

      <ProjectEditor
        project={project}
        videos={videos}
      />
    </div>
  )
}
