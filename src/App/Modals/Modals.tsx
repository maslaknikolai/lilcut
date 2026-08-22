import { useAtom } from 'jotai'
import { activeModalAtom } from '@/App/atoms'
import { ClipCreateModal } from '@/App/Modals/ClipCreateModal/ClipCreateModal'
import { ClipEditModal } from '@/App/Modals/ClipEditModal/ClipEditModal'
import { HelpModal } from '@/App/Modals/HelpModal'

export function Modals() {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)

  function closeModal() {
    setActiveModal(null)
  }

  if (activeModal?.type === 'help') {
    return <HelpModal onClose={closeModal} />
  }

  if (activeModal?.type === 'clipEdit') {
    return (
      <ClipEditModal
        projectId={activeModal.projectId}
        clip={activeModal.clip}
        onClose={closeModal}
      />
    )
  }

  if (activeModal?.type === 'clipCreate') {
    return (
      <ClipCreateModal
        projectId={activeModal.projectId}
        insertAt={activeModal.insertAt}
        onClose={closeModal}
      />
    )
  }

  return null
}
