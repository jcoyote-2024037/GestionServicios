export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {icon && (
        <div className="mb-5 relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white/20 text-4xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {icon}
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-[var(--brand)]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <h3 className="text-white/50 text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-white/25 text-sm max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
