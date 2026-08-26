import { useAtomValue } from 'jotai'
import { FileExclamationPoint, Scissors } from 'lucide-react'
import { videosAtom } from '@/App/atoms'
import { LibraryItem } from '@/App/Sidebar/LibraryItem'
import { ProjectActions } from '@/App/lib/ProjectActions'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/App/lib/ui/tooltip'
import type { Project } from '@/App/lib/types'

type ProjectItemProps = {
  project: Project
}

export function ProjectItem({ project }: ProjectItemProps) {
  const videos = useAtomValue(videosAtom)

  const hasBrokenClips = project.clips.some((clip) => {
    return !videos.some((video) => video.opfsName === clip.videoOpfsName)
  })

  return (
    <LibraryItem
      id={project.id}
      name={project.name}
      icon={
        <>
          <Scissors
            size={14}
            className="shrink-0 text-blue-500"
          />

          {hasBrokenClips && (
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <FileExclamationPoint
                  size={14}
                  className="shrink-0 text-amber-400"
                />
              </TooltipTrigger>
              <TooltipContent>Some clips point to a removed video</TooltipContent>
            </Tooltip>
          )}
        </>
      }
      actions={<ProjectActions project={project} />}
    />
  )
}
