import { FFmpeg } from '@ffmpeg/ffmpeg'
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { fetchFile } from '@ffmpeg/util'
import { readOpfsFile } from './opfs'

// own instance, separate from the export one: cancelling an export terminates
// that worker, which must not kill an in-flight probe
let ffprobePromise: Promise<FFmpeg> | null = null

function loadFfprobe(): Promise<FFmpeg> {
  ffprobePromise ??= (async () => {
    const ffmpeg = new FFmpeg()
    await ffmpeg.load({ coreURL, wasmURL })
    return ffmpeg
  })()
  return ffprobePromise
}

type ProbedStream = {
  codec_type: string
  codec_name: string
  width?: number
  height?: number
  pix_fmt?: string
  sample_rate?: string
  channels?: number
}

const signatureCache = new Map<string, Promise<string>>()
let probeCounter = 0

// the stream parameters that must match across sources for `-c copy` concat
// to produce a valid file
export function getFormatSignature(opfsName: string): Promise<string> {
  const cachedSignature = signatureCache.get(opfsName)
  if (cachedSignature) {
    return cachedSignature
  }

  const signaturePromise = (async () => {
    const ffmpeg = await loadFfprobe()
    const file = await readOpfsFile(opfsName)

    // unique per-call names: probes for different files can be in flight at once
    const probeIndex = probeCounter++
    const extension = opfsName.split('.').pop()
    const inputName = `probe_${probeIndex}.${extension}`
    const outputName = `probe_${probeIndex}.json`

    await ffmpeg.writeFile(inputName, await fetchFile(file))
    await ffmpeg.ffprobe(['-v', 'error', '-show_streams', '-print_format', 'json', inputName, '-o', outputName])
    const output = await ffmpeg.readFile(outputName)
    const outputText = typeof output === 'string' ? output : new TextDecoder().decode(output)
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)

    const { streams } = JSON.parse(outputText) as { streams: ProbedStream[] }
    return streams
      .map((stream) => {
        if (stream.codec_type === 'video') {
          return `video:${stream.codec_name}:${stream.width}x${stream.height}:${stream.pix_fmt}`
        }
        return `${stream.codec_type}:${stream.codec_name}:${stream.sample_rate}:${stream.channels}`
      })
      .join('|')
  })()

  signaturePromise.catch(() => signatureCache.delete(opfsName))
  signatureCache.set(opfsName, signaturePromise)
  return signaturePromise
}
