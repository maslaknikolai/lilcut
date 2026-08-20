import { PauseResumeButton } from './PauseResumeButton'
import { RecordButton } from './RecordButton'

type RecordControlsProps = {
  isWithLabel?: boolean
}

export function RecordControls({ isWithLabel }: RecordControlsProps) {
  return (
    <>
      <RecordButton isWithLabel={isWithLabel} />
      <PauseResumeButton isWithLabel={isWithLabel} />
    </>
  )
}
