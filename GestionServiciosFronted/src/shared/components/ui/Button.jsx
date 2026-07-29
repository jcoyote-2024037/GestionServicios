import { Spinner } from './Spinner'

export const Button = ({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, className = '', ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
  }

  const variantClasses = {
    primary: 'glass-btn',
    secondary: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
    info: 'btn-info',
  }

  return (
    <button
      className={`ripple-btn inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}
