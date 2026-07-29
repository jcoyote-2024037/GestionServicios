export const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="relative">
      <div className={`${sizes[size]} animate-spin rounded-full`}
        style={{
          border: '2px solid rgba(255,255,255,0.06)',
          borderTopColor: 'transparent',
          background: 'conic-gradient(from 0deg, transparent 0%, #f43f5e 50%, #ec4899 100%)',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
        }}
      />
    </div>
  )
}
