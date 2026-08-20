import { useState } from 'react'
import { Trash2 } from 'lucide-react'

type RemoveButtonProps = {
  label: string
  onRemove: () => void
}

export function RemoveButton({ label, onRemove }: RemoveButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (isConfirming) {
      setIsConfirming(false)
      onRemove()
    } else {
      setIsConfirming(true)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onBlur={() => setIsConfirming(false)}
      className={`cursor-pointer px-1.5 pr-2 text-sm font-medium ${
        isConfirming ? 'text-red-400' : 'text-neutral-500 hover:text-red-400'
      }`}
      aria-label={isConfirming ? `Confirm removing ${label}` : `Remove ${label}`}
    >
      {isConfirming ? 'Confirm?' : <Trash2 size={16} />}
    </button>
  )
}
