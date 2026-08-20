import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { loadFfmpeg } from './loadFfmpeg'
import { readOpfsFile } from './opfs'

let ffmpegPromise: Promise<FFmpeg> | null = null

function loadProbeFfmpeg(): Promise<FFmpeg> {
  ffmpegPromise ??= loadFfmpeg()
  return ffmpegPromise
}

export type ProbedStream = {
  codec_type: string
  codec_name: string
  width?: number
  height?: number
  pix_fmt?: string
  sample_rate?: string
  channels?: number
}

export async function probeStreams(opfsName: string): Promise<ProbedStream[]> {
  const ffmpeg = await loadProbeFfmpeg()
  const file = await readOpfsFile(opfsName)

  const probeId = crypto.randomUUID()
  const extension = opfsName.split('.').pop()
  const inputName = `probe_${probeId}.${extension}`
  const outputName = `probe_${probeId}.json`

  await ffmpeg.writeFile(inputName, await fetchFile(file))
  await ffmpeg.ffprobe(['-v', 'error', '-show_streams', '-print_format', 'json', inputName, '-o', outputName])
  const output = await ffmpeg.readFile(outputName)
  const outputText = typeof output === 'string' ? output : new TextDecoder().decode(output)
  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)

  const { streams } = JSON.parse(outputText) as { streams: ProbedStream[] }
  return streams
}

export async function getFormatSignature(opfsName: string): Promise<string> {
  const streams = await probeStreams(opfsName)
  return streams
    .map((stream) => {
      if (stream.codec_type === 'video') {
        return `video:${stream.codec_name}:${stream.width}x${stream.height}:${stream.pix_fmt}`
      }
      return `${stream.codec_type}:${stream.codec_name}:${stream.sample_rate}:${stream.channels}`
    })
    .join('|')
}
