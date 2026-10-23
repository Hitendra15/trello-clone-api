import { TriangleAlert } from 'lucide-react'

/** Empty / error block. `icon` is a lucide component. */
export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="state">
      {Icon && <div className="state-icon"><Icon size={26} /></div>}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry, title = "Couldn't load this page" }) {
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon"><TriangleAlert size={26} /></div>
      <h3>{title}</h3>
      <p>{error?.message || 'Something went wrong.'}</p>
      {onRetry && <button type="button" className="btn" onClick={onRetry}>Try again</button>}
    </div>
  )
}
