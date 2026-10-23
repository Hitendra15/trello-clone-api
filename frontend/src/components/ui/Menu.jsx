import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

/** Small popover menu. `children` is a render function that receives `close`. */
export default function Menu({ label, children, icon: Icon = MoreHorizontal, className = '' }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => { if (!root.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); root.current?.querySelector('button')?.focus() } }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onPointer); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className={`menu ${className}`} ref={root}>
      <button
        type="button" className="btn btn-quiet btn-icon btn-sm"
        aria-haspopup="menu" aria-expanded={open} aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon size={18} />
      </button>
      {open && <div className="menu-panel" role="menu">{children(() => setOpen(false))}</div>}
    </div>
  )
}
