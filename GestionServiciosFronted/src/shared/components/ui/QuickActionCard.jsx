export const QuickActionCard = ({ icon, label, description, onClick, color = 'var(--brand)' }) => {
  return (
    <button
      onClick={onClick}
      className="glass-card glass-card-interactive p-5 text-left group w-full"
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{label}</p>
          {description && (
            <p className="text-white/35 text-xs mt-0.5 line-clamp-1">{description}</p>
          )}
        </div>
        <svg className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-all duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
