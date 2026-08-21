import { useState } from 'react'
import { cn } from '@/lib/utils'

type RenameFieldProps = {
  initialValue: string
  onCommit: (name: string) => void
  className?: string
}

export function RenameField({ initialValue, onCommit, className }: RenameFieldProps) {
  const [editingName, setEditingName] = useState(initialValue)

  function commitRename() {
    const name = editingName.trim()
    if (!name || name === initialValue) {
      setEditingName(initialValue)
      return
    }
    onCommit(name)
  }

  return (
    <input
      value={editingName}
      onChange={(e) => setEditingName(e.target.value)}
      onBlur={commitRename}
      spellCheck={false}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          setEditingName(initialValue)
          e.currentTarget.blur()
        }
      }}
      className={cn(
        'min-h-10 w-full rounded-t border-b border-slate-700 bg-transparent px-0.5 py-2 text-sm font-medium outline-none hover:border-slate-500 focus:border-slate-400',
        className,
      )}
    />
  )
}
