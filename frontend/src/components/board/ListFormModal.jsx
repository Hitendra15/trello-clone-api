import { useState } from 'react'
import { toast } from 'sonner'
import { CircleAlert } from 'lucide-react'
import { listsApi } from '../../api'
import Modal from '../ui/Modal'

export default function ListFormModal({ list, onSaved, onClose }) {
  const [title, setTitle] = useState(list.title)
  const [description, setDescription] = useState(list.description || '')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) { setErrors({ title: 'Give the list a title.' }); return }

    setBusy(true)
    try {
      const saved = await listsApi.update(list.id, { title: trimmed, description: description.trim() })
      toast.success('List saved')
      onSaved(saved)
      onClose()
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(Object.keys(err.fields || {}).length ? '' : err.message)
      setBusy(false)
    }
  }

  return (
    <Modal title="Edit list" onClose={onClose} busy={busy}>
      <form className="modal-body" onSubmit={submit} noValidate>
        {formError && <div className="form-alert" role="alert"><CircleAlert size={18} />{formError}</div>}

        <div className={`field${errors.title ? ' is-invalid' : ''}`}>
          <label htmlFor="list-title">Title</label>
          <input id="list-title" className="input" value={title} maxLength={100}
            onChange={(e) => { setTitle(e.target.value); setErrors({}) }} data-autofocus />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="field">
          <label htmlFor="list-desc">Description <span className="muted">(optional)</span></label>
          <textarea id="list-desc" className="textarea" rows={3} value={description}
            placeholder="Shown under the list title" onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <span className="spinner" />}
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  )
}
