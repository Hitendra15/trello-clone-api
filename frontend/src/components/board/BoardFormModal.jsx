import { useState } from 'react'
import { toast } from 'sonner'
import { CircleAlert } from 'lucide-react'
import { boardsApi } from '../../api'
import Modal from '../ui/Modal'

/** Create (no `board` prop) or edit a board. */
export default function BoardFormModal({ board, onSaved, onClose }) {
  const editing = !!board
  const [name, setName] = useState(board?.name ?? '')
  const [description, setDescription] = useState(board?.description ?? '')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) { setErrors({ name: 'Give the board a name (2+ characters).' }); return }

    setBusy(true)
    setFormError('')
    try {
      const payload = { name: trimmed, description: description.trim() }
      const saved = editing ? await boardsApi.update(board.id, payload) : await boardsApi.create(payload)
      toast.success(editing ? 'Board saved' : 'Board created')
      onSaved(saved)
      onClose()
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(Object.keys(err.fields || {}).length ? '' : err.message)
      setBusy(false)
    }
  }

  return (
    <Modal
      title={editing ? 'Edit board' : 'New board'}
      description={editing ? undefined : 'A board holds the lists and cards for one project.'}
      onClose={onClose} busy={busy}
    >
      <form className="modal-body" onSubmit={submit} noValidate>
        {formError && <div className="form-alert" role="alert"><CircleAlert size={18} />{formError}</div>}

        <div className={`field${errors.name ? ' is-invalid' : ''}`}>
          <label htmlFor="board-name">Name</label>
          <input id="board-name" className="input" value={name} maxLength={100} placeholder="e.g. Website redesign"
            onChange={(e) => { setName(e.target.value); setErrors({}) }} data-autofocus />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className={`field${errors.description ? ' is-invalid' : ''}`}>
          <label htmlFor="board-desc">Description <span className="muted">(optional)</span></label>
          <textarea id="board-desc" className="textarea" value={description} maxLength={500} rows={3}
            placeholder="What is this board for?" onChange={(e) => setDescription(e.target.value)} />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <span className="spinner" />}
            {editing ? 'Save changes' : 'Create board'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
