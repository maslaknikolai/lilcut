import { useAtom } from 'jotai'
import { activeModalAtom } from './atoms'
import { ClipEditorModal } from './ClipEditorModal'
import { HelpModal } from './HelpModal'

export function Modals() {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)

  function closeModal() {
    setActiveModal(null)
  }

  if (activeModal?.type === 'help') {
    return <HelpModal onClose={closeModal} />
  }

  if (activeModal?.type === 'clipEditor') {
    return (
      <ClipEditorModal
        projectId={activeModal.projectId}
        clip={activeModal.clip}
        insertAt={activeModal.insertAt}
        onClose={closeModal}
      />
    )
  }

  return null
}
