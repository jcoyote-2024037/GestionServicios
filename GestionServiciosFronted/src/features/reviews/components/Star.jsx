export const Star = ({ filled, size = 'sm' }) => {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }
  return (
    <svg className={sizes[size] || sizes.sm} fill={filled ? 'var(--accent)' : 'none'} viewBox="0 0 24 24"
      stroke={filled ? 'var(--accent)' : 'rgba(255,255,255,0.2)'} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

export const StarRating = ({ value = 0, onChange, size = 'md', readonly = false, className = '' }) => {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" disabled={readonly}
          onClick={() => onChange?.(s)}
          className={`transition-transform ${readonly ? '' : 'hover:scale-110 cursor-pointer'}`}>
          <svg className={sizes[size] || sizes.md} fill={s <= value ? 'var(--accent)' : 'none'} viewBox="0 0 24 24"
            stroke={s <= value ? 'var(--accent)' : 'rgba(255,255,255,0.15)'} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
