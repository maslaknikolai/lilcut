import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { probeKeyframeTimes, probeStreams } from '@/App/contexts/getFormatSignature'
import { isConcatCompatible } from '@/App/contexts/isConcatCompatible'
import { readOpfsFile } from '@/App/lib/opfs'
import type { PlaybackClip } from '@/App/lib/projectTimeline'
import type { MediaAsset } from '@/App/lib/types'

type RenderCallbacks = {
  onProgress: (overallProgress: number) => void
  onLog: (message: string) => void
  isCancelled: () => boolean
}

type InputClip = {
  inputName: string
  playbackClip: PlaybackClip
  mediaAsset: MediaAsset
}

// Callers pass playback clips (buildPlaybackClips) so uncut spans of one
// recording aren't split just to be concatenated again.
//
// Two render strategies, picked by probing the sources:
// - compatible formats → stream copy: lossless and fast, cuts snap to the
//   nearest keyframe
// - mixed formats → every clip is decoded and re-encoded to shared
//   parameters, then the normalized pieces are concatenated losslessly
export async function renderProjectVideo(
  ffmpeg: FFmpeg,
  playbackClips: PlaybackClip[],
  mediaAssets: MediaAsset[],
  { onProgress, onLog, isCancelled }: RenderCallbacks,
): Promise<Blob | null> {
  const resolvedClips = playbackClips.flatMap((playbackClip) => {
    const mediaAsset = mediaAssets.find((mediaAsset) => mediaAsset.opfsName === playbackClip.mediaAssetOpfsName)
    return mediaAsset ? [{ playbackClip, mediaAsset }] : []
  })
  if (resolvedClips.length === 0) {
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

    const inputClips: InputClip[] = []
    for (const { playbackClip, mediaAsset } of resolvedClips) {
      if (isCancelled()) {
        return null
      }
      const inputName = await ensureInputFile(mediaAsset)
      inputClips.push({ inputName, playbackClip, mediaAsset })
    }

    const opfsNames = resolvedClips.map(({ mediaAsset }) => mediaAsset.opfsName)
    // a probe failure falls back to re-encoding, which works for any mix of
    // formats — only proven-compatible sources take the stream-copy shortcut
    const canStreamCopy = await isConcatCompatible(opfsNames).catch(() => false)

    if (isCancelled()) {
      return null
    }

    // stream copy can only start video on a keyframe while audio starts at the
    // requested time — snapping the cut start to the preceding keyframe makes
    // both streams begin together, so repeated clips can't accumulate A/V
    // drift. a failed probe keeps the requested cut points (the old behavior)
    const isStreamCopyPlan = inputClips.length === 1 || canStreamCopy
    const keyframeTimesByOpfsName = new Map<string, number[]>()
    if (isStreamCopyPlan) {
      for (const opfsName of new Set(opfsNames)) {
        if (isCancelled()) {
          return null
        }
        const keyframeTimes = await probeKeyframeTimes(opfsName).catch(() => [])
        keyframeTimesByOpfsName.set(opfsName, keyframeTimes)
      }
    }

    if (inputClips.length === 1) {
      await execSingleClipCopy(ffmpeg, inputClips[0], keyframeTimesByOpfsName)
    } else if (canStreamCopy) {
      await execConcatStreamCopy(ffmpeg, inputClips, keyframeTimesByOpfsName)
    } else {
      await execConcatReencode(ffmpeg, inputClips)
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

// the latest keyframe at or before `time`; without keyframe data the
// requested time stays as is
export function snapToPrecedingKeyframe(time: number, keyframeTimes: number[]): number {
  const precedingTimes = keyframeTimes.filter((keyframeTime) => keyframeTime <= time)
  if (!precedingTimes.length) {
    return time
  }
  return precedingTimes[precedingTimes.length - 1]
}

function snappedCutStart(
  { playbackClip, mediaAsset }: InputClip,
  keyframeTimesByOpfsName: Map<string, number[]>,
): number {
  const keyframeTimes = keyframeTimesByOpfsName.get(mediaAsset.opfsName) ?? []
  return snapToPrecedingKeyframe(playbackClip.cutStart, keyframeTimes)
}

// one clip needs no concat: trim with stream copy
async function execSingleClipCopy(
  ffmpeg: FFmpeg,
  inputClip: InputClip,
  keyframeTimesByOpfsName: Map<string, number[]>,
): Promise<void> {
  const cutStart = snappedCutStart(inputClip, keyframeTimesByOpfsName)
  await ffmpeg.exec([
    '-ss',
    String(cutStart),
    '-i',
    inputClip.inputName,
    '-t',
    String(inputClip.playbackClip.cutEnd - cutStart),
    '-c',
    'copy',
    'output.mp4',
  ])
}

async function execConcatStreamCopy(
  ffmpeg: FFmpeg,
  inputClips: InputClip[],
  keyframeTimesByOpfsName: Map<string, number[]>,
): Promise<void> {
  const concatEntries = inputClips.map((inputClip) => {
    const inpoint = snappedCutStart(inputClip, keyframeTimesByOpfsName)
    return `file '${inputClip.inputName}'\ninpoint ${inpoint}\noutpoint ${inputClip.playbackClip.cutEnd}`
  })
  await execConcatList(ffmpeg, `ffconcat version 1.0\n\n${concatEntries.join('\n\n')}\n`)
}

// mixed formats: re-encode every clip to shared parameters (the first
// clip's resolution), then concatenate the now-identical pieces losslessly.
// assumes every source has an audio stream; sources recorded
// without audio need an anullsrc fallback here
async function execConcatReencode(ffmpeg: FFmpeg, inputClips: InputClip[]): Promise<void> {
  const firstStreams = await probeStreams(inputClips[0].mediaAsset.opfsName)
  const firstVideoStream = firstStreams.find((stream) => stream.codec_type === 'video')
  const targetWidth = makeEven(firstVideoStream?.width ?? 1280)
  const targetHeight = makeEven(firstVideoStream?.height ?? 720)
  const normalizeFilter = [
    `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease`,
    `pad=${targetWidth}:${targetHeight}:-1:-1`,
    'setsar=1',
    'fps=30',
  ].join(',')

  const clipFileNames: string[] = []
  for (const [index, { inputName, playbackClip }] of inputClips.entries()) {
    const clipFileName = `clip_${index}.mp4`
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
      clipFileName,
    ])
    clipFileNames.push(clipFileName)
  }

  const concatEntries = clipFileNames.map((clipFileName) => `file '${clipFileName}'`)
  await execConcatList(ffmpeg, `ffconcat version 1.0\n\n${concatEntries.join('\n')}\n`)

  for (const clipFileName of clipFileNames) {
    await ffmpeg.deleteFile(clipFileName)
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
