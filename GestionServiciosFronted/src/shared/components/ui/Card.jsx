export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        glass-card p-6 transition-all duration-300
        ${hover ? 'cursor-pointer hover:scale-[1.02] hover:border-purple-500/30' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
