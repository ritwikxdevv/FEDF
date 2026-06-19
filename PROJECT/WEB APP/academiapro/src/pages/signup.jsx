import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password, role: 'student' }),
      })

      // Registration successful — redirect to login
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-sm">
      <div className="w-full max-w-sm fade-in-up">
        <h1 className="text-headline-md font-semibold text-on-surface mb-1">Create account</h1>
        <p className="text-body-sm text-on-surface-variant mb-6">Join AcademiaPro today</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="input-field w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant uppercase tracking-widest">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input-field w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-label-caps text-on-surface-variant uppercase tracking-widest">Password</label>
            <input
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
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="text-body-sm text-on-surface-variant mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
