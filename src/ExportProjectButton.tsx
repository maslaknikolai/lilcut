import { useAtomValue } from 'jotai'
import { FilePlay, LoaderCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { mediaAssetsAtom } from './atoms'
import { GhostButton } from './GhostButton'
import { buildPlaybackClips, buildTimelineClips } from './projectTimeline'
import type { Project } from './types'
import { useConcatCompatibility } from './useConcatCompatibility'
import { useExportJobContext } from './useExportJobContext'

type ExportProjectButtonProps = {
  project: Project
}

const INDICATOR_CLASS_NAMES = {
  probeFailed: 'text-slate-500',
  compatible: 'text-green-400',
  incompatible: 'text-amber-400',
}

const TOOLTIP_TEXTS = {
  probing: 'Checking whether clips share stream parameters…',
  probeFailed: 'Could not inspect the clips — export will pick the safe re-encoding path',
  compatible:
    'All clips share codec, resolution, and audio parameters — export copies the streams without re-encoding (fast, lossless)',
  incompatible: 'Clips have mismatched stream parameters — export will re-encode them to shared parameters (slower)',
}

export function ExportProjectButton({ project }: ExportProjectButtonProps) {
  const { job, startExport } = useExportJobContext()
  const mediaAssets = useAtomValue(mediaAssetsAtom)
  const isExporting = job.status === 'exporting'

  const playbackClips = buildPlaybackClips(buildTimelineClips(project, mediaAssets))
  const concatCompatibility = useConcatCompatibility(playbackClips)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <GhostButton
          onClick={() => startExport(project)}
          disabled={isExporting || project.clips.length === 0}
          className="shrink-0 px-3 py-1.5 text-sm text-violet-400"
        >
          <FilePlay size={14} />
          {isExporting ? 'Exporting…' : 'Export mp4'}
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
