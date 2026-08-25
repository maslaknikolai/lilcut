import { useEffect, useEffectEvent, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { probeMediaInfo } from '@/App/contexts/getFormatSignature'
import { GhostButton } from '@/App/lib/GhostButton'
import { Modal } from '@/App/Modals/Modal'

type VideoInfoModalProps = {
  opfsName: string
  onClose: () => void
}

type InfoSection = {
  title: string
  entries: [string, string][]
}

function toEntries(source: object): [string, string][] {
  return Object.entries(source).map(([key, value]) => {
    const text = value && typeof value === 'object' ? JSON.stringify(value) : String(value)
    return [key, text]
  })
}

export function VideoInfoModal({ opfsName, onClose }: VideoInfoModalProps) {
  const [sections, setSections] = useState<InfoSection[] | null>(null)
  const [probeJson, setProbeJson] = useState('')
  const [isFailed, setIsFailed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const probe = useEffectEvent(() => {
    probeMediaInfo(opfsName)
      .then(({ streams, format }) => {
        setProbeJson(JSON.stringify({ streams, format }, null, 2))
        const streamSections = streams.map((stream, index) => ({
          title: `Stream #${index} (${stream.codec_type})`,
          entries: toEntries(stream),
        }))
        setSections([{ title: 'Format', entries: toEntries(format) }, ...streamSections])
      })
      .catch(() => setIsFailed(true))
  })

  useEffect(() => {
    probe()
  }, [opfsName])

  function copyAll() {
    navigator.clipboard
      .writeText(probeJson)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 1500)
      })
      .catch(() => setIsCopied(false))
  }

  return (
    <Modal
      title="Video info"
      onClose={onClose}
      className="overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 text-xs break-all text-slate-500">{opfsName}</span>

        {!!probeJson && (
          <GhostButton
            onClick={copyAll}
            className="shrink-0 px-3"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? 'Copied' : 'Copy probe JSON'}</span>
          </GhostButton>
        )}
      </div>

      {isFailed && <span className="text-sm text-red-400">Could not read this file.</span>}

      {!isFailed && !sections && <span className="text-sm text-slate-400">Reading with ffprobe…</span>}

      {sections?.map((section) => (
        <section key={section.title}>
          <h3 className="mb-1 text-sm font-medium text-white">{section.title}</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 font-mono text-xs">
            {section.entries.map(([key, value]) => (
              <div
                key={key}
                className="contents"
              >
                <dt className="text-slate-400">{key}</dt>
                <dd className="break-all text-slate-100">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </Modal>
  )
}
