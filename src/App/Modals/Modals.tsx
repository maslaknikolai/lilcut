import { useAtom } from 'jotai'
import { activeModalAtom, ModalType } from '@/App/atoms'
import { ClipCreateModal } from '@/App/Modals/ClipCreateModal/ClipCreateModal'
import { ClipEditModal } from '@/App/Modals/ClipEditModal/ClipEditModal'
import { HelpModal } from '@/App/Modals/HelpModal'
import { ProjectRemoveModal } from '@/App/Modals/ProjectRemoveModal'
import { VideoInfoModal } from '@/App/Modals/VideoInfoModal'

export function Modals() {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom)

  function closeModal() {
    setActiveModal(null)
  }

  if (activeModal?.type === ModalType.Help) {
    return <HelpModal onClose={closeModal} />
  }

  if (activeModal?.type === ModalType.ClipEdit) {
    return (
      <ClipEditModal
        projectId={activeModal.projectId}
        clip={activeModal.clip}
        onClose={closeModal}
      />
    )
  }

  if (activeModal?.type === ModalType.ClipCreate) {
    return (
      <ClipCreateModal
        projectId={activeModal.projectId}
        insertAt={activeModal.insertAt}
        onClose={closeModal}
      />
    )
  }

  if (activeModal?.type === ModalType.VideoInfo) {
    return (
      <VideoInfoModal
        opfsName={activeModal.opfsName}
        onClose={closeModal}
      />
    )
  }

  if (activeModal?.type === ModalType.ProjectRemove) {
    return (
      <ProjectRemoveModal
        projectId={activeModal.projectId}
        onClose={closeModal}
      />
    )
  }

  return null
}
