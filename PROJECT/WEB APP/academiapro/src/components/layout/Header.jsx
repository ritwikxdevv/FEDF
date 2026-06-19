import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconButton } from '../ui/index.jsx'

const tabs = [
  { label: 'Overview',      path: '/admin' },
  { label: 'Live Sessions', path: '/admin/live' },
  { label: 'Archives',      path: '/admin/archives' },
]

export default function Header() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const role = localStorage.getItem('role') || 'student'

  return (
    <header className="h-16 flex items-center px-gutter border-b border-outline-variant bg-surface-container-lowest/80
                       backdrop-blur-nav sticky top-0 z-40 gap-gutter">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          placeholder="Search students, exams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-full pl-9"
        />
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1 flex-1">
        {role === 'admin' && tabs.map(t => (
          <button
            key={t.label}
            onClick={() => navigate(t.path)}
            className={`px-3 py-1.5 text-body-sm font-medium rounded-md transition-colors
                        ${pathname === t.path
                          ? 'text-on-surface border-b-2 border-primary pb-[5px]'
                          : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-xs ml-auto">

        <IconButton icon="notifications" label="Notifications" />

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary flex items-center
                        justify-center text-sm font-bold font-mono cursor-pointer
                        hover:ring-2 ring-primary/50 transition-all">
          AK
        </div>
      </div>
    </header>
  )
}
