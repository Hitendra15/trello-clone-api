import { useEffect, useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Menu from '../ui/Menu'
import DraggableTaskCard from './TaskCard'

/** Inline "add card" composer: Enter adds and stays open for the next card, Esc cancels. */
function CardComposer({ onAdd, onCancel }) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  useEffect(() => { ref.current?.focus() }, [])

  const submit = async () => {
    const value = title.trim()
    if (!value) { onCancel(); return }
    if (value.length < 2) { setError('Use at least 2 characters.'); return }
    setBusy(true)
    try {
      await onAdd(value)
      setTitle('')
      ref.current?.focus()
    } catch { /* the caller shows the error toast */ }
    setBusy(false)
  }

  return (
    <div className="composer">
      <textarea
        ref={ref} className="textarea" rows={2} value={title} disabled={busy} maxLength={100}
        placeholder="Enter a title for this card" aria-label="Card title"
        onChange={(e) => { setTitle(e.target.value); setError('') }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
        }}
      />
      {error && <span className="field-error">{error}</span>}
      <div className="composer-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={busy}>Add card</button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={onCancel}>Done</button>
      </div>
    </div>
  )
}

export default function ListColumn({ list, tasks, total, filtering, onOpenTask, onToggleDone, onAddTask, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: `list-${list.id}` })
  const [composing, setComposing] = useState(false)
  const body = useRef(null)

  // Keep the newest card in view while adding several in a row.
  useEffect(() => {
    if (composing && body.current) body.current.scrollTop = body.current.scrollHeight
  }, [tasks.length, composing])

  return (
    <section className={`column${isOver ? ' is-over' : ''}`} aria-label={list.title}>
      <header className="column-head">
        <div className="column-title">
          <h2 title={list.title}>{list.title}</h2>
          <span className="count">{filtering ? `${tasks.length}/${total}` : total}</span>
        </div>
        <Menu label={`Actions for list ${list.title}`}>
          {(close) => (
            <>
              <button type="button" className="menu-item" role="menuitem" onClick={() => { close(); onEdit(list) }}>
                <Pencil size={16} /> Edit list
              </button>
              <button type="button" className="menu-item" role="menuitem" onClick={() => { close(); setComposing(true) }}>
                <Plus size={16} /> Add a card
              </button>
              <div className="menu-sep" />
              <button type="button" className="menu-item is-danger" role="menuitem" onClick={() => { close(); onDelete(list) }}>
                <Trash2 size={16} /> Delete list
              </button>
            </>
          )}
        </Menu>
      </header>
      {list.description && <p className="column-desc">{list.description}</p>}

      <div className="column-body" ref={(node) => { setNodeRef(node); body.current = node }}>
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} onOpen={() => onOpenTask(task)} onToggleDone={onToggleDone} />
        ))}
        {tasks.length === 0 && !composing && (
          <p className="column-empty">{filtering && total > 0 ? 'No cards match the filter.' : 'Drop a card here or add one.'}</p>
        )}
        {composing && <CardComposer onAdd={(title) => onAddTask(list.id, title)} onCancel={() => setComposing(false)} />}
      </div>

      {!composing && (
        <button type="button" className="column-add" onClick={() => setComposing(true)}>
          <Plus size={17} /> Add a card
        </button>
      )}
    </section>
  )
}
