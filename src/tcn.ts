import cn from 'classnames'
import { twMerge } from 'tailwind-merge'

export function tcn(...classnames: cn.ArgumentArray) {
  return twMerge(cn(classnames))
}
