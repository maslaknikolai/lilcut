import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageTitleFieldProps = {
  label: string
  icon: ReactNode
  initialValue: string
  onChange: (name: string) => void
  className?: string
}

export function PageTitleField({ label, icon, initialValue, onChange, className }: PageTitleFieldProps) {
  const [editingName, setEditingName] = useState(initialValue)

  function commitChange() {
    const name = editingName.trim()
    if (!name || name === initialValue) {
      setEditingName(initialValue)
      return
    }
    onChange(name)
  }

  return (
    <label className="flex w-full min-w-0 flex-col">
      <span className="px-0.5 text-xs text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onBlur={commitChange}
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
      </div>
    </label>
  )
}
