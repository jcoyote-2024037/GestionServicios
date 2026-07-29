export const Input = ({ label, error, icon: Icon, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-medium text-white/40">{label}</label>}
    <div className="input-wrapper">
      {Icon && (
        <div className="input-icon">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        className={`glass-input ${Icon ? 'pl-10' : ''} ${error ? '!border-red-500/50 !shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
)

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-medium text-white/40">{label}</label>}
    <textarea
      className={`glass-input resize-none ${error ? '!border-red-500/50 !shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
)

export const Select = ({ label, error, className = '', children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-medium text-white/40">{label}</label>}
    <select
      className={`glass-input cursor-pointer ${error ? '!border-red-500/50' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
)
