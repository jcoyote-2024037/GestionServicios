import { Modal } from './Modal'

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', danger = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-white/60 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            danger
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
              : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
