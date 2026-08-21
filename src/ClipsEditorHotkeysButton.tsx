import { useState, type ReactNode } from 'react'
import { Keyboard, Space } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-slate-500 px-1 text-xs text-slate-500">{children}</kbd>
}

export function ClipsEditorHotkeysButton() {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  return (
    <Tooltip
      disableHoverableContent
      open={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
    >
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setIsTooltipOpen((prev) => !prev)}
          className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-900 hover:text-slate-200"
          aria-label="Editor hotkeys"
        >
          <Keyboard size={16} />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-1.5 [&>span:nth-child(odd)]:text-right">
          <span>
            <Kbd>
              <Space
                size={14}
                className="inline align-middle"
              />
            </Kbd>
          </span>
          <span>Play / pause</span>

          <span>
            <Kbd>←</Kbd> <Kbd>→</Kbd>
          </span>
          <span>Seek 1s</span>

          <span className="text-slate-500">
            <Kbd>Shift</Kbd> + <Kbd>←</Kbd> <Kbd>→</Kbd>
          </span>
          <span>Seek 0.01s</span>

          <span className="text-slate-500">
            <Kbd>Cmd/Ctrl</Kbd> + <Kbd>←</Kbd> <Kbd>→</Kbd>
          </span>
          <span>Seek 30s</span>

          <span className="text-slate-500">
            <Kbd>Alt</Kbd> + <Kbd>←</Kbd> <Kbd>→</Kbd>
          </span>
          <span>Previous / next clip</span>

          <span>
            <Kbd>Backspace</Kbd> <Kbd>Delete</Kbd>
          </span>
          <span>Remove current clip</span>

          <span>
            <Kbd>C</Kbd>
          </span>
          <span>Cut here</span>

          <span>
            <Kbd>0</Kbd>
          </span>
          <span>Reset timeline zoom</span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
