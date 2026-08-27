import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FilePlay, Info, Scissors } from 'lucide-react'
import { activeModalAtom, ModalType, libraryOrderAtom, videosAtom, projectsAtom } from '@/App/atoms'
import { CreateProjectFromVideoButton } from '@/App/pages/VideoPage/CreateProjectFromVideoButton'
import { formatBytes } from '@/App/lib/formatBytes'
import { GhostButton } from '@/App/lib/GhostButton'
import { VideoActions } from '@/App/lib/VideoActions'
import { PageTitleField } from '@/App/lib/PageTitleField'
import type { Video } from '@/App/lib/types'
import { useVideoActions } from '@/App/lib/useVideoActions'
import { useVideoUrl } from '@/App/pages/VideoPage/useVideoUrl'
import { useSelectedLibraryItemId } from '@/App/lib/useSelectedLibraryItemId'

type VideoPageProps = {
  video: Video
}

export function VideoPage({ video }: VideoPageProps) {
  const videoUrl = useVideoUrl(video)
  const videos = useAtomValue(videosAtom)
  const { renameVideo } = useVideoActions()
  const [projects, setProjects] = useAtom(projectsAtom)
  const setLibraryOrder = useSetAtom(libraryOrderAtom)
  const setActiveModal = useSetAtom(activeModalAtom)
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useSelectedLibraryItemId()
  const [isNameTaken, setIsNameTaken] = useState(false)

  async function commitRename(opfsName: string) {
    const isTaken = videos.some((item) => item.opfsName !== video.opfsName && item.opfsName === opfsName)
    if (isTaken) {
      setIsNameTaken(true)
      setTimeout(() => setIsNameTaken(false), 1500)
      return
    }
    await renameVideo(video.opfsName, opfsName)
    setProjects((prev) =>
      prev.map((project) => {
        const clips = project.clips.map((clip) => {
          if (clip.videoOpfsName !== video.opfsName) {
            return clip
          }
          return { ...clip, videoOpfsName: opfsName }
        })
        return { ...project, clips }
      }),
    )
    setLibraryOrder((prev) => prev.map((id) => (id === video.opfsName ? opfsName : id)))
    if (selectedLibraryItemId === video.opfsName) {
      setSelectedLibraryItemId(opfsName)
    }
  }

  const projectsUsingAsset = projects.filter((project) =>
    project.clips.some((clip) => clip.videoOpfsName === video.opfsName),
  )

  return (
    <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto bg-violet-950/50">
      <div className="flex gap-2 p-4 pl-14 md:pl-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <PageTitleField
            key={video.opfsName}
            label="Video"
            icon={
              <FilePlay
                size={16}
                className="shrink-0 text-violet-500"
              />
            }
            initialValue={video.opfsName}
            onChange={commitRename}
            className={isNameTaken ? 'ring-1 ring-red-500' : ''}
          />
          <span className="px-0.5 pt-1 text-xs text-slate-500">{formatBytes(video.size)}</span>
        </div>

        <div className="flex items-center gap-1 pt-6 self-start">
          <VideoActions video={video} />
        </div>
      </div>
      <div className="flex h-[66vh] shrink-0 items-center justify-center overflow-hidden rounded bg-slate-950 px-4">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="max-h-full max-w-full"
          />
        ) : (
          <span className="text-slate-400">Loading…</span>
        )}
      </div>
      <div className="flex flex-col gap-2 px-4 py-4 text-xs text-slate-500">
        <div className="flex flex-wrap gap-2">
          <CreateProjectFromVideoButton video={video} />

          <GhostButton
            onClick={() => setActiveModal({ type: ModalType.VideoInfo, opfsName: video.opfsName })}
            className="px-3"
          >
            <Info size={14} />
            <span>Video info</span>
          </GhostButton>
        </div>

        {projectsUsingAsset.length > 0 && (
          <div>
            Used in projects:
            <div className="flex flex-wrap gap-2 mt-1">
              {projectsUsingAsset.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedLibraryItemId(project.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded border border-slate-700 px-2 py-1 text-slate-100 hover:border-slate-500 active:border-slate-400 active:bg-slate-900"
                >
                  <Scissors
                    size={14}
                    className="shrink-0 text-blue-500"
                  />
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
