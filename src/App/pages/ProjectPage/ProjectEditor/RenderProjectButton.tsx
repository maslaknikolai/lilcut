import { useAtomValue } from 'jotai'
import { FilePlay, LoaderCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/App/lib/ui/tooltip'
import { mediaAssetsAtom } from '@/App/atoms'
import { GhostButton } from '@/App/lib/GhostButton'
import { buildPlaybackClips, buildTimelineClips } from '@/App/lib/projectTimeline'
import type { Project } from '@/App/lib/types'
import { useConcatCompatibility } from '@/App/pages/ProjectPage/ProjectEditor/useConcatCompatibility'
import { useRenderJobContext } from '@/App/contexts/useRenderJobContext'

type RenderProjectButtonProps = {
  project: Project
}

const INDICATOR_CLASS_NAMES = {
  probeFailed: 'text-slate-500',
  compatible: 'text-green-400',
  incompatible: 'text-amber-400',
}

const TOOLTIP_TEXTS = {
  probing: 'Checking whether clips share stream parameters…',
  probeFailed: 'Could not inspect the clips — rendering will pick the safe re-encoding path',
  compatible:
    'All clips share codec, resolution, and audio parameters — rendering copies the streams without re-encoding (fast, lossless)',
  incompatible: 'Clips have mismatched stream parameters — rendering will re-encode them to shared parameters (slower)',
}

export function RenderProjectButton({ project }: RenderProjectButtonProps) {
  const { job, startRender } = useRenderJobContext()
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const isRendering = job.status === 'rendering'

  const playbackClips = buildPlaybackClips(buildTimelineClips(project.clips, mediaAssets))
  const concatCompatibility = useConcatCompatibility(playbackClips)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <GhostButton
          onClick={() => startRender(project)}
          disabled={isRendering || project.clips.length === 0}
          className="shrink-0"
        >
          <FilePlay
            className="text-violet-400"
            size={14}
          />
          {isRendering ? 'Rendering…' : 'Render .mp4'}
          {project.clips.length > 0 &&
            (concatCompatibility === 'probing' ? (
              <LoaderCircle
                size={14}
                className="animate-spin text-slate-500"
              />
            ) : (
              <span className={INDICATOR_CLASS_NAMES[concatCompatibility]}>●</span>
            ))}
        </GhostButton>
      </TooltipTrigger>

      <TooltipContent>{TOOLTIP_TEXTS[concatCompatibility]}</TooltipContent>
    </Tooltip>
  )
}
