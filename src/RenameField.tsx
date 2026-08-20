import { useState } from 'react'
import { tcn } from './tcn'

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
      className={tcn(
        'w-full rounded bg-transparent px-2 py-2 text-sm font-medium outline-none hover:bg-slate-900 focus:bg-slate-900',
        className,
      )}
    />
  )
}
