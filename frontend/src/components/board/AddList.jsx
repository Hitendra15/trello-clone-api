import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'

export default function AddList({ onAdd, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  useEffect(() => { if (open) ref.current?.focus() }, [open])

  const submit = async (e) => {
    e.preventDefault()
    const value = title.trim()
    if (!value) { setError('Give the list a title.'); return }
    setBusy(true)
    try {
      await onAdd(value)
      setTitle('')
      setError('')
      ref.current?.focus()
    } catch { /* the caller shows the error toast */ }
    setBusy(false)
  }

  if (!open) {
    return (
      <button type="button" className="add-list" onClick={() => setOpen(true)}>
        <Plus size={18} /> Add a list
      </button>
    )
  }

  return (
    <form className="add-list is-open" onSubmit={submit} noValidate>
      <input
        ref={ref} className="input" value={title} maxLength={100} disabled={busy}
        placeholder="List title, e.g. In review" aria-label="List title"
        onChange={(e) => { setTitle(e.target.value); setError('') }}
        onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setTitle('') } }}
      />
      {error && <span className="field-error">{error}</span>}
      <div className="composer-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>Add list</button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => { setOpen(false); setTitle(''); setError('') }}>Cancel</button>
      </div>
    </form>
  )
}
