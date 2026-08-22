import { Scissors } from 'lucide-react'
import { LibraryItem } from '@/App/Sidebar/LibraryItem'
import { ProjectActions } from '@/App/lib/ProjectActions'
import type { Project } from '@/App/lib/types'

type ProjectItemProps = {
  project: Project
}

export function ProjectItem({ project }: ProjectItemProps) {
  return (
    <LibraryItem
      id={project.id}
      name={project.name}
      icon={
        <Scissors
          size={14}
          className="shrink-0 text-blue-500"
        />
      }
      actions={<ProjectActions project={project} />}
    />
  )
}
