// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    flagged:  'badge-flagged',
    review:   'badge-review',
    resolved: 'badge-resolved',
    success:  'badge-success',
    info:     'badge-info',
    default:  'badge bg-surface-container-highest text-on-surface-variant border border-outline-variant',
  }
  return (
    <span className={`badge ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', children, className = '', icon, ...props }) {
  const cls = {
    primary: 'btn-primary',
    ghost:   'btn-ghost',
    danger:  'btn-danger',
    link:    'text-primary text-body-sm font-medium hover:underline underline-offset-2 inline-flex items-center gap-1',
  }
  return (
    <button className={`${cls[variant] || cls.primary} ${className}`} {...props}>
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 'md', color = 'indigo' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  const colors = {
    indigo: 'bg-primary/20 text-primary',
    blue:   'bg-secondary/20 text-secondary',
    orange: 'bg-tertiary/20 text-tertiary',
    zinc:   'bg-surface-container-highest text-on-surface-variant',
  }
  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full flex items-center justify-center font-bold font-mono flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, change, sub, icon, trend }) {
  const trendColors = {
    up:      'text-green-400',
    down:    'text-red-400',
    neutral: 'text-on-surface-variant',
    live:    'text-primary',
    warn:    'text-tertiary',
  }
  return (
    <div className="stat-card fade-in-up">
      <div className="flex items-start justify-between mb-sm">
        <p className="text-label-caps font-mono uppercase tracking-widest text-on-surface-variant">{label}</p>
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant/50">{icon}</span>
      </div>
      <p className="text-3xl font-bold font-geist text-on-surface tracking-tight">{value}</p>
      {change && (
        <p className={`text-body-sm mt-1 ${trendColors[trend] || 'text-green-400'} flex items-center gap-1`}>
          {trend === 'up' && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
          {change}
        </p>
      )}
      {sub && (
        <p className={`text-body-sm mt-1 flex items-center gap-1 ${trendColors[trend] || 'text-on-surface-variant'}`}>
          {trend === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />}
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`card overflow-hidden shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant">
          <div>
            <h3 className="font-semibold text-on-surface text-body-base">{title}</h3>
            {subtitle && <p className="text-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'primary', className = '' }) {
  const pct = Math.round((value / max) * 100)
  const colors = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-tertiary',
    error:   'bg-error',
    blue:    'bg-secondary',
  }
  return (
    <div className={`h-1.5 bg-surface-container-highest rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${colors[color] || colors.primary} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Icon Button ─────────────────────────────────────────────────────────────
export function IconButton({ icon, label, onClick, className = '' }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-md text-on-surface-variant
                  hover:bg-surface-container-high hover:text-on-surface transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}
