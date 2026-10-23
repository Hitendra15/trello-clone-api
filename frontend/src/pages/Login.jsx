import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CircleAlert } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../components/AuthLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { status, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  if (status === 'authed') return <Navigate to={from} replace />

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
    setFormError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address, like name@example.com.'
    if (!form.password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    setFormError('')
    try {
      await signIn(form.email.trim(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={<>New here? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={submit} noValidate className="stack">
        {formError && <div className="form-alert" role="alert"><CircleAlert size={18} />{formError}</div>}

        <div className={`field${errors.email ? ' is-invalid' : ''}`}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" autoFocus
            value={form.email} onChange={change} placeholder="name@example.com"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-err' : undefined} />
          {errors.email && <span id="email-err" className="field-error">{errors.email}</span>}
        </div>

        <div className={`field${errors.password ? ' is-invalid' : ''}`}>
          <label htmlFor="password">Password</label>
          <div className="input-group">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="input" autoComplete="current-password"
              value={form.password} onChange={change}
              aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-err' : undefined} />
            <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span id="password-err" className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy && <span className="spinner" />}
          {busy ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
