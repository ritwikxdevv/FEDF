export default function BarChart({ data, height = 220 }) {
  const max = Math.max(...data.map(d => d.participation))

  return (
    <div className="relative">
      {/* Y-axis lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8" style={{ height }}>
        {[100, 75, 50, 25, 0].map(v => (
          <div key={v} className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-on-surface-variant/50 w-5 text-right">{v}</span>
            <div className="flex-1 border-t border-outline-variant/30" />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div
        className="flex items-end gap-1.5 px-7 relative"
        style={{ height }}
      >
        {data.map((d, i) => (
          <div key={d.month} className="flex-1 relative h-full flex flex-col justify-end gap-0.5 pb-7 group">
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-outline-variant
                            rounded-md px-2 py-1 text-[10px] font-mono text-on-surface whitespace-nowrap
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-float">
              P: {d.participation}% | S: {d.success}%
            </div>

            {/* Participation bar */}
            <div
              className="flex-shrink-0 bg-surface-container-highest hover:bg-surface-bright rounded-t-sm transition-colors bar-grow"
              style={{
                height: `${(d.participation / max) * 70}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
            {/* Success bar */}
            <div
              className="flex-shrink-0 bg-primary/70 hover:bg-primary rounded-t-sm transition-colors bar-grow"
              style={{
                height: `${(d.success / max) * 70}%`,
                animationDelay: `${i * 0.05 + 0.05}s`,
              }}
            />

            {/* X label */}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold
                             text-on-surface-variant uppercase tracking-wide">
              {d.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
