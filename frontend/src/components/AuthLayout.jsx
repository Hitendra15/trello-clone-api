import Logo from './Logo'

/** Split screen for sign in / sign up. The left panel is a small board that echoes the product. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <section className="auth-art" aria-hidden="true">
        <span className="brand"><Logo /> Trello Clone</span>
        <div className="auth-copy">
          <h2>Keep every project moving.</h2>
          <p>Lists, cards and due dates on one board. Drag work from idea to done.</p>
        </div>
        <div className="mini-board">
          <div className="mini-col">
            <b />
            <i style={{ '--w': '82%' }} /><i style={{ '--w': '60%' }} /><i style={{ '--w': '74%' }} />
          </div>
          <div className="mini-col">
            <b />
            <i style={{ '--w': '68%' }} /><i style={{ '--w': '88%' }} />
            <i className="is-lifted" style={{ '--w': '72%' }} />
          </div>
          <div className="mini-col">
            <b />
            <i className="is-done" style={{ '--w': '78%' }} /><i className="is-done" style={{ '--w': '54%' }} />
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form">
          <span className="brand auth-brand-mobile"><Logo size={26} /> Trello Clone</span>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </section>
    </div>
  )
}
