import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { Download } from 'lucide-react'
import { mediaFilesAtom, selectedMediaFileIdAtom } from './atoms'
import { readOpfsFile, writeOpfsFile } from './opfs'
import type { Clip, MediaFile, Project } from './types'

let ffmpegPromise: Promise<FFmpeg> | null = null

// single-threaded core: no SharedArrayBuffer, so no cross-origin-isolation
// headers needed on the server — trades away multi-threaded speed for that
function loadFfmpeg(): Promise<FFmpeg> {
  ffmpegPromise ??= (async () => {
    const ffmpeg = new FFmpeg()
    await ffmpeg.load({ coreURL, wasmURL })
    return ffmpeg
  })()
  return ffmpegPromise
}

type ExportProjectButtonProps = {
  project: Project
}

export function ExportProjectButton({ project }: ExportProjectButtonProps) {
  const mediaFiles = useAtomValue(mediaFilesAtom)
  const setMediaFiles = useSetAtom(mediaFilesAtom)
  const setSelectedMediaFileId = useSetAtom(selectedMediaFileIdAtom)
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  async function handleExport() {
    const segments: { clip: Clip; mediaFile: MediaFile }[] = []
    for (const clip of project.clips) {
      const mediaFile = mediaFiles.find((file) => file.id === clip.mediaFileId)
      if (mediaFile) {
        segments.push({ clip, mediaFile })
      }
    }
    if (segments.length === 0) {
      return
    }

    setIsExporting(true)
    setExportProgress(0)
    try {
      const ffmpeg = await loadFfmpeg()

      // each clip trim plus the final concat is one ffmpeg command; progress
      // resets to 0 at the start of each command, so track how many of the
      // total commands are already done to turn per-command progress into
      // one overall percentage
      const totalSteps = segments.length + 1
      let completedSteps = 0
      function handleProgress({ progress }: { progress: number }) {
        // ffmpeg's reported progress isn't guaranteed monotonic within a
        // command (e.g. the concat step's duration estimate can get revised
        // mid-run), so never let the displayed value move backwards
        const clampedProgress = Math.min(1, Math.max(0, progress))
        const overallProgress = (completedSteps + clampedProgress) / totalSteps
        setExportProgress((prev) => Math.max(prev, overallProgress))
      }
      ffmpeg.on('progress', handleProgress)

      try {
        const segmentNames: string[] = []

        for (const [index, { clip, mediaFile }] of segments.entries()) {
          const extension = mediaFile.opfsName.split('.').pop()
          const inputName = `input_${index}.${extension}`
          const sourceFile = await readOpfsFile(mediaFile.opfsName)
          await ffmpeg.writeFile(inputName, await fetchFile(sourceFile))

          // -ss/-to after -i decodes from the start for a frame-accurate cut,
          // rather than snapping to the nearest keyframe
          const args = ['-i', inputName, '-ss', String(clip.cutStart ?? 0)]
          if (clip.cutEnd !== undefined) {
            args.push('-to', String(clip.cutEnd))
          }
          const segmentName = `segment_${index}.mp4`
          args.push('-c:v', 'libx264', '-c:a', 'aac', segmentName)
          await ffmpeg.exec(args)
          completedSteps += 1
          await ffmpeg.deleteFile(inputName)
          segmentNames.push(segmentName)
        }

        const concatListName = 'concat.txt'
        const concatList = segmentNames.map((name) => `file '${name}'`).join('\n')
        await ffmpeg.writeFile(concatListName, concatList)
        await ffmpeg.exec([
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          concatListName,
          '-c',
          'copy',
          'output.mp4',
        ])
        completedSteps += 1

        const output = await ffmpeg.readFile('output.mp4')
        const bytes = typeof output === 'string' ? new TextEncoder().encode(output) : output
        const blob = new Blob([new Uint8Array(bytes)], { type: 'video/mp4' })

        const exportedName = `Exported: ${project.name}`
        const exportedId = crypto.randomUUID()
        const exportedOpfsName = `${exportedId}.mp4`
        await writeOpfsFile(exportedOpfsName, blob)
        setMediaFiles((prev) => [
          {
            id: exportedId,
            name: exportedName,
            createdAt: Date.now(),
            opfsName: exportedOpfsName,
            mimeType: 'video/mp4',
          },
          ...prev,
        ])
        setSelectedMediaFileId(exportedId)
        navigate('/files')

        await ffmpeg.deleteFile(concatListName)
        await ffmpeg.deleteFile('output.mp4')
        for (const name of segmentNames) {
          await ffmpeg.deleteFile(name)
        }
      } finally {
        ffmpeg.off('progress', handleProgress)
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting || project.clips.length === 0}
        className="flex shrink-0 items-center gap-1.5 rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={14} />
        {isExporting ? `Exporting ${Math.round(exportProgress * 100)}%` : 'Export mp4'}
      </button>

      {isExporting && (
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-300">
          <div
            className="h-full rounded-full bg-neutral-900"
            style={{ width: `${exportProgress * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
