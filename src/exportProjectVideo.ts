import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { probeStreams } from './getFormatSignature'
import { isConcatCompatible } from './isConcatCompatible'
import { readOpfsFile } from './opfs'
import type { PlaybackClip } from './projectTimeline'
import type { MediaAsset } from './types'

type ExportCallbacks = {
  onProgress: (overallProgress: number) => void
  onLog: (message: string) => void
  isCancelled: () => boolean
}

type InputSegment = {
  inputName: string
  playbackClip: PlaybackClip
  mediaAsset: MediaAsset
}

// Callers pass playback clips (buildPlaybackClips) so uncut spans of one
// recording aren't split just to be concatenated again.
//
// Two export strategies, picked by probing the sources:
// - compatible formats → stream copy: lossless and fast, cuts snap to the
//   nearest keyframe
// - mixed formats → every segment is decoded and re-encoded to shared
//   parameters, then the normalized pieces are concatenated losslessly
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

    const inputSegments: InputSegment[] = []
    for (const { playbackClip, mediaAsset } of segments) {
      if (isCancelled()) {
        return null
      }
      const inputName = await ensureInputFile(mediaAsset)
      inputSegments.push({ inputName, playbackClip, mediaAsset })
    }

    const opfsNames = segments.map(({ mediaAsset }) => mediaAsset.opfsName)
    // a probe failure falls back to re-encoding, which works for any mix of
    // formats — only proven-compatible sources take the stream-copy shortcut
    const canStreamCopy = await isConcatCompatible(opfsNames).catch(() => false)

    if (isCancelled()) {
      return null
    }

    if (inputSegments.length === 1) {
      await execSingleClipCopy(ffmpeg, inputSegments[0])
    } else if (canStreamCopy) {
      await execConcatStreamCopy(ffmpeg, inputSegments)
    } else {
      await execConcatReencode(ffmpeg, inputSegments)
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

// one clip needs no concat: trim with stream copy
async function execSingleClipCopy(ffmpeg: FFmpeg, { inputName, playbackClip }: InputSegment): Promise<void> {
  await ffmpeg.exec([
    '-ss',
    String(playbackClip.cutStart),
    '-i',
    inputName,
    '-t',
    String(playbackClip.cutEnd - playbackClip.cutStart),
    '-c',
    'copy',
    'output.mp4',
  ])
}

async function execConcatStreamCopy(ffmpeg: FFmpeg, inputSegments: InputSegment[]): Promise<void> {
  const concatEntries = inputSegments.map(({ inputName, playbackClip }) => {
    return `file '${inputName}'\ninpoint ${playbackClip.cutStart}\noutpoint ${playbackClip.cutEnd}`
  })
  await execConcatList(ffmpeg, `ffconcat version 1.0\n\n${concatEntries.join('\n\n')}\n`)
}

// mixed formats: re-encode every segment to shared parameters (the first
// clip's resolution), then concatenate the now-identical pieces losslessly.
// assumes every source has an audio stream; sources recorded
// without audio need an anullsrc fallback here
async function execConcatReencode(ffmpeg: FFmpeg, inputSegments: InputSegment[]): Promise<void> {
  const firstStreams = await probeStreams(inputSegments[0].mediaAsset.opfsName)
  const firstVideoStream = firstStreams.find((stream) => stream.codec_type === 'video')
  const targetWidth = makeEven(firstVideoStream?.width ?? 1280)
  const targetHeight = makeEven(firstVideoStream?.height ?? 720)
  const normalizeFilter = [
    `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease`,
    `pad=${targetWidth}:${targetHeight}:-1:-1`,
    'setsar=1',
    'fps=30',
  ].join(',')

  const segmentNames: string[] = []
  for (const [index, { inputName, playbackClip }] of inputSegments.entries()) {
    const segmentName = `segment_${index}.mp4`
    await ffmpeg.exec([
      '-ss',
      String(playbackClip.cutStart),
      '-i',
      inputName,
      '-t',
      String(playbackClip.cutEnd - playbackClip.cutStart),
      '-vf',
      normalizeFilter,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-ar',
      '48000',
      '-ac',
      '2',
      segmentName,
    ])
    segmentNames.push(segmentName)
  }

  const concatEntries = segmentNames.map((segmentName) => `file '${segmentName}'`)
  await execConcatList(ffmpeg, `ffconcat version 1.0\n\n${concatEntries.join('\n')}\n`)

  for (const segmentName of segmentNames) {
    await ffmpeg.deleteFile(segmentName)
  }
}

async function execConcatList(ffmpeg: FFmpeg, concatList: string): Promise<void> {
  const concatListName = 'project.ffconcat'
  await ffmpeg.writeFile(concatListName, concatList)
  await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', concatListName, '-c', 'copy', 'output.mp4'])
  await ffmpeg.deleteFile(concatListName)
}

// libx264 rejects odd dimensions
function makeEven(size: number): number {
  return Math.floor(size / 2) * 2
}
