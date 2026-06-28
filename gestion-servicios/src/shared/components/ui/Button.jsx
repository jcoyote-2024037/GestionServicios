import { Spinner } from './Spinner'

export const Button = ({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, className = '', ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'text-white',
    secondary: 'border-2 bg-transparent',
    ghost:     'bg-transparent',
    danger:    'text-white bg-red-500 hover:bg-red-600',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }

  const styles = {
    primary:   { background: 'var(--orange)', color: '#fff' },
    secondary: { borderColor: 'var(--navy)', color: 'var(--navy)' },
    ghost:     { color: 'var(--navy)' },
    danger:    {},
  }

  const hoverClass = variant === 'primary' ? 'hover:opacity-90 hover:shadow-lg hover:-translate-y-px active:translate-y-0'
    : variant === 'secondary' ? 'hover:bg-navy hover:text-white'
    : 'hover:bg-gray-100'

  return (
    <button
      style={styles[variant]}
      className={`${base} ${variants[variant]} ${sizes[size]} ${hoverClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}
