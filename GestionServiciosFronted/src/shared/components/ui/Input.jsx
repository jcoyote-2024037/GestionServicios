export const Input = ({ label, error, icon: Icon, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-sm font-medium" style={{ color: 'var(--gray-1)' }}>
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--gray-3)' }}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none ${Icon ? 'pl-10' : ''} ${className}`}
        style={{
          borderColor: error ? 'var(--error)' : 'var(--gray-5)',
          background: 'var(--bg-white)',
          color: 'var(--gray-1)',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--navy)'; e.target.style.boxShadow = '0 0 0 3px rgba(15,45,84,0.08)' }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--gray-5)'; e.target.style.boxShadow = 'none' }}
        {...props}
      />
    </div>
    {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
  </div>
)

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium" style={{ color: 'var(--gray-1)' }}>{label}</label>}
    <textarea
      className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none resize-none ${className}`}
      style={{ borderColor: error ? 'var(--error)' : 'var(--gray-5)', background: 'var(--bg-white)', color: 'var(--gray-1)' }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--navy)'; e.target.style.boxShadow = '0 0 0 3px rgba(15,45,84,0.08)' }}
      onBlur={(e) => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--gray-5)'; e.target.style.boxShadow = 'none' }}
      {...props}
    />
    {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
  </div>
)

export const Select = ({ label, error, className = '', children, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium" style={{ color: 'var(--gray-1)' }}>{label}</label>}
    <select
      className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none appearance-none cursor-pointer ${className}`}
      style={{ borderColor: error ? 'var(--error)' : 'var(--gray-5)', background: 'var(--bg-white)', color: 'var(--gray-1)' }}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
  </div>
)
