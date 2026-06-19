import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      // Persist auth data returned by the backend
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userId', data._id)

      // Redirect based on role
      navigate(data.role === 'admin' ? '/admin' : '/student')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-sm">
      <div className="w-full max-w-sm fade-in-up">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-headline-md font-semibold text-primary">AcademiaPro</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant uppercase tracking-widest">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              className="input-field w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant uppercase tracking-widest">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className="input-field w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-body-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-md px-sm py-xs">
              {error}
            </p>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-body-sm text-on-surface-variant mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
