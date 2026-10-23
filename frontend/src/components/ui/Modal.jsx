import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * Accessible dialog: focus moves in on open and is restored on close,
 * Tab is trapped, Esc and backdrop click close it (unless `busy`).
 */
export default function Modal({ title, description, onClose, busy = false, wide = false, children }) {
  const panel = useRef(null)
  const titleId = useId()
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const previous = document.activeElement
    const node = panel.current
    const target = node.querySelector('[data-autofocus]') || node.querySelector('input, textarea, select') || node.querySelector(FOCUSABLE)
    target?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (previous && document.contains(previous)) previous.focus()
    }
  }, [])

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && !busy) {
      event.stopPropagation()
      closeRef.current()
      return
    }
    if (event.key !== 'Tab') return
    const items = [...panel.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose() }}
      onKeyDown={onKeyDown}
    >
      <div ref={panel} className={`modal${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={onClose} disabled={busy} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
