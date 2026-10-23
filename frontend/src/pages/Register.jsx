import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CircleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../auth/AuthContext'
import AuthLayout from '../components/AuthLayout'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const { status, signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password2: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  if (status === 'authed' && !busy) return <Navigate to="/" replace />

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
    setFormError('')
  }

  const validate = () => {
    const next = {}
    if (form.first_name.trim().length < 2) next.first_name = 'Enter your first name (2+ characters).'
    if (form.last_name.trim().length < 2) next.last_name = 'Enter your last name (2+ characters).'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address, like name@example.com.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (form.password2 !== form.password) next.password2 = "Passwords don't match."
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    setFormError('')
    try {
      await signUp({ ...form, first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim() })
      toast.success('Account created. Welcome aboard!')
      navigate('/', { replace: true })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(Object.keys(err.fields || {}).length ? '' : err.message)
      setBusy(false)
    }
  }

  const field = (name, label, props = {}) => (
    <div className={`field${errors[name] ? ' is-invalid' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" value={form[name]} onChange={change}
        aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} {...props} />
      {errors[name] && <span id={`${name}-err`} className="field-error">{errors[name]}</span>}
    </div>
  )

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up a workspace in under a minute."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form onSubmit={submit} noValidate className="stack">
        {formError && <div className="form-alert" role="alert"><CircleAlert size={18} />{formError}</div>}

        <div className="field-row">
          {field('first_name', 'First name', { autoComplete: 'given-name', autoFocus: true })}
          {field('last_name', 'Last name', { autoComplete: 'family-name' })}
        </div>
        {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'name@example.com' })}

        <div className={`field${errors.password ? ' is-invalid' : ''}`}>
          <label htmlFor="password">Password</label>
          <div className="input-group">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="input" autoComplete="new-password"
              value={form.password} onChange={change} aria-invalid={!!errors.password} aria-describedby="password-note" />
            <button type="button" className="btn btn-quiet btn-icon btn-sm" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? <span id="password-note" className="field-error">{errors.password}</span>
            : <span id="password-note" className="field-hint">At least 8 characters.</span>}
        </div>

        {field('password2', 'Confirm password', { type: showPassword ? 'text' : 'password', autoComplete: 'new-password' })}

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy && <span className="spinner" />}
          {busy ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
