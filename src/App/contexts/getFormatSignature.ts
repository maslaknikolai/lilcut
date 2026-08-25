import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { loadFfmpeg } from '@/App/contexts/loadFfmpeg'
import { readOpfsFile } from '@/App/lib/opfs'

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
  avg_frame_rate?: string
  bit_rate?: string
}

export type ProbedFormat = {
  format_name?: string
  bit_rate?: string
}

async function runProbe(opfsName: string, probeArgs: string[]): Promise<string> {
  const ffmpeg = await loadProbeFfmpeg()
  const file = await readOpfsFile(opfsName)

  const probeId = crypto.randomUUID()
  const extension = opfsName.split('.').pop()
  const inputName = `probe_${probeId}.${extension}`
  const outputName = `probe_${probeId}.json`

  await ffmpeg.writeFile(inputName, await fetchFile(file))
  await ffmpeg.ffprobe(['-v', 'error', ...probeArgs, '-print_format', 'json', inputName, '-o', outputName])
  const output = await ffmpeg.readFile(outputName)
  const outputText = typeof output === 'string' ? output : new TextDecoder().decode(output)
  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)

  return outputText
}

export async function probeStreams(opfsName: string): Promise<ProbedStream[]> {
  const outputText = await runProbe(opfsName, ['-show_streams'])
  const { streams } = JSON.parse(outputText) as { streams: ProbedStream[] }
  return streams
}

type ProbedPacket = {
  pts_time?: string
  dts_time?: string
  flags?: string
}

// keyframe timestamps of the first video stream, ascending.
// reads packets only (no decode), but does list every packet of the stream
export async function probeKeyframeTimes(opfsName: string): Promise<number[]> {
  const outputText = await runProbe(opfsName, [
    '-select_streams',
    'v:0',
    '-show_packets',
    '-show_entries',
    'packet=pts_time,dts_time,flags',
  ])
  const parsed = JSON.parse(outputText) as { packets: ProbedPacket[] }
  console.log('WIPWIP', parsed)
  const { packets } = parsed

  const keyframeTimes = packets
    .filter((packet) => packet.flags?.includes('K'))
    .map((packet) => Number(packet.pts_time ?? packet.dts_time))
    .filter((time) => Number.isFinite(time))
  return keyframeTimes.sort((a, b) => a - b)
}

export async function probeMediaInfo(opfsName: string): Promise<{ streams: ProbedStream[]; format: ProbedFormat }> {
  const outputText = await runProbe(opfsName, ['-show_streams', '-show_format'])
  return JSON.parse(outputText) as { streams: ProbedStream[]; format: ProbedFormat }
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
