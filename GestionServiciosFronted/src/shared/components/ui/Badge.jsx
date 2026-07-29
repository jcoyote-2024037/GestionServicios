export const Badge = ({ children, color = 'purple', className = '' }) => {
  const colors = {
    purple: { bg: 'rgba(167, 139, 250, 0.15)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.25)', glow: 'rgba(167, 139, 250, 0.08)' },
    green: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.25)', glow: 'rgba(74, 222, 128, 0.08)' },
    red: { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171', border: 'rgba(248, 113, 113, 0.25)', glow: 'rgba(248, 113, 113, 0.08)' },
    yellow: { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', border: 'rgba(250, 204, 21, 0.25)', glow: 'rgba(250, 204, 21, 0.08)' },
    blue: { bg: 'rgba(96, 165, 250, 0.15)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.25)', glow: 'rgba(96, 165, 250, 0.08)' },
    gray: { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.25)', glow: 'rgba(156, 163, 175, 0.08)' },
    orange: { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.25)', glow: 'rgba(251, 146, 60, 0.08)' },
    pink: { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.25)', glow: 'rgba(244, 63, 94, 0.08)' },
  }

  const c = colors[color] || colors.purple

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200"
      style={{
        background: c.bg,
        color: c.text,
        borderColor: c.border,
        boxShadow: `0 0 12px ${c.glow}`,
      }}
    >
      {children}
    </span>
  )
}
