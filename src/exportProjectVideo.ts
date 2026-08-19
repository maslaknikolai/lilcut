import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { readOpfsFile } from './opfs'
import type { PlaybackClip } from './projectTimeline'
import type { MediaAsset } from './types'

type ExportCallbacks = {
  onProgress: (overallProgress: number) => void
  onLog: (message: string) => void
  isCancelled: () => boolean
}

// stream-copy export: no re-encoding, so cuts snap to the nearest keyframe.
// Callers pass playback clips (buildPlaybackClips) so uncut spans of one
// recording aren't split just to be concatenated again.
export async function exportProjectVideo(
  ffmpeg: FFmpeg,
  playbackClips: PlaybackClip[],
  mediaAssets: MediaAsset[],
  { onProgress, onLog, isCancelled }: ExportCallbacks,
): Promise<Blob | null> {
  const segments = playbackClips.flatMap((playbackClip) => {
    const mediaAsset = mediaAssets.find((mediaAsset) => mediaAsset.opfsName === playbackClip.mediaAssetOpfsName)
    return mediaAsset ? [{ playbackClip, mediaAsset }] : []
  })
  if (segments.length === 0) {
    return null
  }

  function handleProgress({ progress }: { progress: number }) {
    const clampedProgress = Math.min(1, Math.max(0, progress))
    onProgress(clampedProgress)
  }
  function handleLog({ message }: { message: string }) {
    onLog(message)
  }
  ffmpeg.on('progress', handleProgress)
  ffmpeg.on('log', handleLog)

  try {
    const inputNameByOpfsName = new Map<string, string>()

    async function ensureInputFile(mediaAsset: MediaAsset): Promise<string> {
      const existingName = inputNameByOpfsName.get(mediaAsset.opfsName)
      if (existingName) {
        return existingName
      }
      const extension = mediaAsset.opfsName.split('.').pop()
      const inputName = `input_${inputNameByOpfsName.size}.${extension}`
      const sourceFile = await readOpfsFile(mediaAsset.opfsName)
      await ffmpeg.writeFile(inputName, await fetchFile(sourceFile))
      inputNameByOpfsName.set(mediaAsset.opfsName, inputName)
      return inputName
    }

    const inputSegments: { inputName: string; playbackClip: PlaybackClip }[] = []
    for (const { playbackClip, mediaAsset } of segments) {
      if (isCancelled()) {
        return null
      }
      const inputName = await ensureInputFile(mediaAsset)
      inputSegments.push({ inputName, playbackClip })
    }

    const concatListName = 'project.ffconcat'

    if (inputSegments.length === 1) {
      const { inputName, playbackClip } = inputSegments[0]
      await ffmpeg.exec([
        '-ss', String(playbackClip.cutStart),
        '-i', inputName,
        '-t', String(playbackClip.cutEnd - playbackClip.cutStart),
        '-c', 'copy',
        'output.mp4',
      ])
    } else {
      const concatEntries = inputSegments.map(({ inputName, playbackClip }) => {
        return `file '${inputName}'\ninpoint ${playbackClip.cutStart}\noutpoint ${playbackClip.cutEnd}`
      })
      const concatList = `ffconcat version 1.0\n\n${concatEntries.join('\n\n')}\n`
      await ffmpeg.writeFile(concatListName, concatList)
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', concatListName, '-c', 'copy', 'output.mp4'])
      await ffmpeg.deleteFile(concatListName)
    }

    if (isCancelled()) {
      return null
    }

    const output = await ffmpeg.readFile('output.mp4')
    const bytes = typeof output === 'string' ? new TextEncoder().encode(output) : output
    const blob = new Blob([new Uint8Array(bytes)], { type: 'video/mp4' })

    await ffmpeg.deleteFile('output.mp4')
    for (const inputName of inputNameByOpfsName.values()) {
      await ffmpeg.deleteFile(inputName)
    }

    return blob
  } finally {
    ffmpeg.off('progress', handleProgress)
    ffmpeg.off('log', handleLog)
  }
}
