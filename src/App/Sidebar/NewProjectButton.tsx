import { Scissors } from 'lucide-react'
import { GhostButton } from '@/App/lib/GhostButton'
import { useCreateProject } from '@/App/lib/useCreateProject'

export function NewProjectButton() {
  const createProject = useCreateProject()

  return (
    <GhostButton onClick={createProject}>
      <Scissors
        size={14}
        className="text-blue-400"
      />
      <span>New project</span>
    </GhostButton>
  )
}
