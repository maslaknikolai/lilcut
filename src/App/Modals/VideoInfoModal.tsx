import { useEffect, useEffectEvent, useState } from 'react'
import { probeMediaInfo, type ProbedFormat, type ProbedStream } from '@/App/contexts/getFormatSignature'
import { Modal } from '@/App/Modals/Modal'

type VideoInfoModalProps = {
  opfsName: string
  onClose: () => void
}

function formatFps(rate?: string): string {
  const [numerator, denominator] = (rate ?? '').split('/').map(Number)
  if (!numerator || !denominator) {
    return '—'
  }
  return `${Math.round((numerator / denominator) * 100) / 100} fps`
}

function formatBitrate(bitsPerSecond?: string): string {
  const bitrate = Number(bitsPerSecond)
  if (!bitrate) {
    return '—'
  }
  return `${Math.round(bitrate / 1000)} kbps`
}

function getRows(streams: ProbedStream[], format: ProbedFormat) {
  const videoStream = streams.find((stream) => stream.codec_type === 'video')
  if (!videoStream) {
    return [['Video stream', 'none']]
  }
  return [
    ['Resolution', `${videoStream.width}×${videoStream.height}`],
    ['FPS', formatFps(videoStream.avg_frame_rate)],
    ['Bitrate', formatBitrate(videoStream.bit_rate ?? format.bit_rate)],
    ['Codec', videoStream.codec_name],
    ['Pixel format', videoStream.pix_fmt ?? '—'],
  ]
}

export function VideoInfoModal({ opfsName, onClose }: VideoInfoModalProps) {
  const [rows, setRows] = useState<string[][] | null>(null)
  const [isFailed, setIsFailed] = useState(false)

  const probe = useEffectEvent(() => {
    probeMediaInfo(opfsName)
      .then(({ streams, format }) => setRows(getRows(streams, format)))
      .catch(() => setIsFailed(true))
  })

  useEffect(() => {
    probe()
  }, [opfsName])

  return (
    <Modal
      title="Video info"
      onClose={onClose}
      className="overflow-y-auto"
    >
      <span className="text-xs break-all text-slate-500">{opfsName}</span>

      {isFailed && <span className="text-sm text-red-400">Could not read this file.</span>}

      {!isFailed && !rows && <span className="text-sm text-slate-400">Reading with ffprobe…</span>}

      {rows && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="contents"
            >
              <dt className="text-slate-400">{label}</dt>
              <dd className="text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  )
}
