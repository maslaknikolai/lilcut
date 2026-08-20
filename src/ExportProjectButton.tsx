import { useAtomValue } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { mediaAssetsAtom } from './atoms'
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
  incompatible:
    'Clips have mismatched stream parameters — export will re-encode them to shared parameters (slower)',
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
        <button
          type="button"
          onClick={() => startExport(project)}
          disabled={isExporting || project.clips.length === 0}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {concatCompatibility === 'probing' ? (
            <LoaderCircle
              size={14}
              className="animate-spin text-slate-500"
            />
          ) : (
            <span className={INDICATOR_CLASS_NAMES[concatCompatibility]}>●</span>
          )}
          {isExporting ? 'Exporting…' : 'Export mp4'}
        </button>
      </TooltipTrigger>

      <TooltipContent>{TOOLTIP_TEXTS[concatCompatibility]}</TooltipContent>
    </Tooltip>
  )
}
