import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { readOpfsFile } from './opfs'
import type { Clip, MediaFile } from './types'

type ExportCallbacks = {
  onProgress: (overallProgress: number) => void
  onLog: (message: string) => void
  isCancelled: () => boolean
}

export async function exportProjectVideo(
  ffmpeg: FFmpeg,
  clips: Clip[],
  mediaFiles: MediaFile[],
  { onProgress, onLog, isCancelled }: ExportCallbacks,
): Promise<Blob | null> {
  const segments = clips.flatMap((clip) => {
    const mediaFile = mediaFiles.find((file) => file.id === clip.mediaFileId)
    return mediaFile ? [{ clip, mediaFile }] : []
  })
  if (segments.length === 0) {
    return null
  }

  // each clip trim plus the final concat is one ffmpeg command;
  // progress resets to 0 at the start of each command, so track how many of the
  // total commands are already done to turn per-command progress into
  // one overall percentage
  const totalSteps = segments.length + 1
  let completedSteps = 0
  function handleProgress({ progress }: { progress: number }) {
    // ffmpeg's reported progress isn't guaranteed monotonic within a
    // command (e.g. the concat step's duration estimate can get revised
    // mid-run), so never let the displayed value move backwards
    const clampedProgress = Math.min(1, Math.max(0, progress))
    onProgress((completedSteps + clampedProgress) / totalSteps)
  }
  function handleLog({ message }: { message: string }) {
    onLog(message)
  }
  ffmpeg.on('progress', handleProgress)
  ffmpeg.on('log', handleLog)

  try {
    const segmentNames: string[] = []

    for (const [index, { clip, mediaFile }] of segments.entries()) {
      if (isCancelled()) {
        return null
      }

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

    if (isCancelled()) {
      return null
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

    if (isCancelled()) {
      return null
    }

    const output = await ffmpeg.readFile('output.mp4')
    const bytes = typeof output === 'string' ? new TextEncoder().encode(output) : output
    const blob = new Blob([new Uint8Array(bytes)], { type: 'video/mp4' })

    await ffmpeg.deleteFile(concatListName)
    await ffmpeg.deleteFile('output.mp4')
    for (const name of segmentNames) {
      await ffmpeg.deleteFile(name)
    }

    return blob
  } finally {
    ffmpeg.off('progress', handleProgress)
    ffmpeg.off('log', handleLog)
  }
}
