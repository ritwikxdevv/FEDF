import { NavLink, useNavigate } from 'react-router-dom'

const adminNavItems = [
  { to: '/admin',       label: 'Analytics',              icon: 'dashboard' },
  { to: '/students',    label: 'Student Management',     icon: 'groups' },
  { to: '/exams',       label: 'Exam Management',        icon: 'quiz' },
  { to: '/results',     label: 'Results',                icon: 'analytics' },
  { to: '/suspicious',  label: 'Suspicious Activities',  icon: 'warning' },
]

const studentNavItems = [
  { to: '/student',     label: 'Assigned Exams',         icon: 'dashboard' },
  { to: '/my-results',  label: 'My Results',             icon: 'analytics' },
  { to: '/schedule',    label: 'Schedule',               icon: 'calendar_month' },
  { to: '/settings',    label: 'Profile',                icon: 'person' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role') || 'student'
  const navItems = role === 'admin' ? adminNavItems : studentNavItems

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-[240px] sidebar-glass border-r border-outline-variant flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 px-md flex items-center border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-xs">
          <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined icon-filled text-[18px] text-on-primary">school</span>
          </div>
          <h1 className="font-bold text-[15px] tracking-tight text-on-surface font-geist">AcademiaPro</h1>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-xs space-y-0.5 overflow-y-auto mt-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group text-sm font-medium
               ${isActive
                 ? 'nav-item-active text-on-surface'
                 : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
               }`
            }
            end
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[20px] transition-colors
                                  ${isActive ? 'icon-filled text-primary' : 'group-hover:text-on-surface'}`}>
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-xs border-t border-outline-variant space-y-0.5">

        <NavLink
          to="/support"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                     text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
          Support
        </NavLink>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                           text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 transition-all">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
