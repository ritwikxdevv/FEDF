import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-on-surface px-sm">
      <div className="text-center fade-in-up">
        <h1 className="text-display-lg font-semibold text-primary mb-4">AcademiaPro</h1>
        <p className="text-body-base text-on-surface-variant mb-8 max-w-md mx-auto">
          Smarter exam management for modern institutions.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login"
            className="btn-primary">
            Login
          </Link>
          <Link to="/signup"
            className="btn-ghost">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
