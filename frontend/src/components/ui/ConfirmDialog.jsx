import { useState } from 'react'
import Modal from './Modal'

/** Confirmation for destructive actions. `onConfirm` may be async. */
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      setBusy(false) // the caller shows the error; keep the dialog open to retry
    }
  }

  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <div className="modal-body">
        <p className="muted">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy} data-autofocus>
            {busy && <span className="spinner" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
