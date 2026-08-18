import { Plus } from 'lucide-react'

export const INSERT_CLIP_BUTTON_WIDTH_PX = 16

type InsertClipButtonProps = {
  onClick: () => void
}

export function InsertClipButton({ onClick }: InsertClipButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="flex w-4 shrink-0 cursor-pointer items-center justify-center rounded text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900"
      aria-label="Add clip here"
    >
      <Plus size={12} />
    </button>
  )
}
