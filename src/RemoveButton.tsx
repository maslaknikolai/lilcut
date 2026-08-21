import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarItemAction } from './SidebarItemAction'

type RemoveButtonProps = {
  label: string
  onRemove: () => void
}

export function RemoveButton({ label, onRemove }: RemoveButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  function handleClick() {
    if (isConfirming) {
      setIsConfirming(false)
      onRemove()
    } else {
      setIsConfirming(true)
    }
  }

  return (
    <SidebarItemAction
      onClick={handleClick}
      onBlur={() => setIsConfirming(false)}
      label={isConfirming ? `Confirm removing ${label}` : `Remove ${label}`}
      tooltip={isConfirming ? 'Click again to confirm' : 'Remove'}
      className={cn('pr-2 text-sm font-medium active:text-red-300', isConfirming ? 'text-red-400' : 'hover:text-red-400')}
    >
      {isConfirming ? 'Confirm?' : <Trash2 size={16} />}
    </SidebarItemAction>
  )
}
