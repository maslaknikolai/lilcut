import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { CheckIcon } from 'lucide-react'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-slate-700 transition-colors outline-none hover:border-slate-500 focus-visible:border-slate-400 focus-visible:ring-3 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-slate-100 data-checked:bg-slate-100 data-checked:text-slate-900',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
