import { Plus } from 'lucide-react'
import { tcn } from './tcn'

export const INSERT_CLIP_BUTTON_WIDTH_PX = 16

type InsertClipButtonProps = {
  onClick: () => void
  className?: string
}

export function InsertClipButton({ onClick, className }: InsertClipButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={tcn(
        'flex w-4 shrink-0 cursor-pointer items-center justify-center rounded text-neutral-600 hover:bg-neutral-800 hover:text-neutral-100',
        'absolute',
        className,
      )}
      aria-label="Add clip here"
    >
      <Plus size={12} />
    </button>
  )
}
