import { useState } from 'react'
import { toast } from 'sonner'
import { CircleAlert, Trash2 } from 'lucide-react'
import { tasksApi } from '../../api'
import { STATUSES, formatDateTime, fromLocalInput, toLocalInput } from '../../lib/format'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'

/**
 * Edit a card. Only changed fields are sent (PATCH), because the API
 * re-validates every field it receives, e.g. it rejects an unchanged due
 * date once that date has passed.
 *
 * `lists`: [{ id, title, boardName? }] the card can be moved to.
 */
export default function TaskModal({ task, lists, onSaved, onDeleted, onClose }) {
  const [form, setForm] = useState(() => ({
    title: task.title,
    description: task.description || '',
    status: task.status,
    due: toLocalInput(task.due_date),
    list: String(task.list),
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: undefined }))
    setFormError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    const patch = {}

    const title = form.title.trim()
    if (title.length < 2) next.title = 'Give the card a title (2+ characters).'
    else if (title !== task.title) patch.title = title

    const description = form.description.trim()
    if (description !== (task.description || '').trim()) {
      if (description.length < 5) {
        next.description = task.description
          ? "Descriptions need at least 5 characters. Edit the text instead of clearing it."
          : 'Use at least 5 characters, or leave this empty.'
      } else patch.description = description
    }

    if (form.due !== toLocalInput(task.due_date)) {
      const iso = fromLocalInput(form.due)
      if (iso && new Date(iso) < new Date()) next.due = "Due date can't be in the past."
      else patch.due_date = iso
    }

    if (form.status !== task.status) patch.status = form.status
    if (Number(form.list) !== task.list) patch.list = Number(form.list)

    setErrors(next)
    if (Object.keys(next).length) return
    if (!Object.keys(patch).length) { onClose(); return }

    setBusy(true)
    try {
      const saved = await tasksApi.update(task.id, patch)
      onSaved(saved)
      toast.success('Card saved')
      onClose()
    } catch (err) {
      const fields = { ...err.fields, due: err.fields?.due_date }
      setErrors(fields)
      setFormError(Object.values(err.fields || {}).length ? '' : err.message)
      setBusy(false)
    }
  }

  const remove = async () => {
    try {
      await tasksApi.remove(task.id)
      onDeleted(task.id)
      toast.success('Card deleted')
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  return (
    <>
      <Modal title="Edit card" onClose={onClose} busy={busy} wide>
        <form className="modal-body" onSubmit={submit} noValidate>
          {formError && <div className="form-alert" role="alert"><CircleAlert size={18} />{formError}</div>}

          <div className="task-layout">
            <div className="stack">
              <div className={`field${errors.title ? ' is-invalid' : ''}`}>
                <label htmlFor="task-title">Title</label>
                <input id="task-title" className="input" maxLength={100} value={form.title}
                  onChange={(e) => set('title', e.target.value)} />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </div>

              <div className={`field${errors.description ? ' is-invalid' : ''}`}>
                <label htmlFor="task-desc">Description</label>
                <textarea id="task-desc" className="textarea task-desc" rows={7} value={form.description}
                  placeholder="Add details, links or a checklist…" onChange={(e) => set('description', e.target.value)} />
                {errors.description && <span className="field-error">{errors.description}</span>}
              </div>
            </div>

            <div className="stack">
              <div className="field">
                <span className="field-label" id="status-label">Status</span>
                <div className="segmented segmented-stack" role="radiogroup" aria-labelledby="status-label">
                  {STATUSES.map(({ value, label, icon: Icon }) => (
                    <label key={value}>
                      <input type="radio" name="status" value={value} checked={form.status === value}
                        onChange={() => set('status', value)} />
                      <Icon size={15} />{label}
                    </label>
                  ))}
                </div>
              </div>

              <div className={`field${errors.due ? ' is-invalid' : ''}`}>
                <label htmlFor="task-due">Due date</label>
                <input id="task-due" type="datetime-local" className="input" value={form.due}
                  onChange={(e) => set('due', e.target.value)} />
                {errors.due
                  ? <span className="field-error">{errors.due}</span>
                  : form.due && <button type="button" className="link-btn" onClick={() => set('due', '')}>Remove due date</button>}
              </div>

              <div className="field">
                <label htmlFor="task-list">List</label>
                <select id="task-list" className="select" value={form.list} onChange={(e) => set('list', e.target.value)}>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>{l.boardName ? `${l.boardName} / ${l.title}` : l.title}</option>
                  ))}
                </select>
              </div>

              <p className="field-hint task-meta">
                Created {formatDateTime(task.created_at)}<br />Updated {formatDateTime(task.updated_at)}
              </p>
            </div>
          </div>

          <div className="modal-actions modal-actions-split">
            <button type="button" className="btn btn-danger-quiet" onClick={() => setConfirming(true)} disabled={busy}>
              <Trash2 size={17} /> Delete card
            </button>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={onClose} disabled={busy}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy && <span className="spinner" />}
                Save changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {confirming && (
        <ConfirmDialog
          title="Delete this card?"
          message={`"${task.title}" will be permanently deleted.`}
          confirmLabel="Delete card"
          onConfirm={remove}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  )
}
