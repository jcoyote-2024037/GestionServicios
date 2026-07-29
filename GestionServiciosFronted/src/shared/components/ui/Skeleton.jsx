export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-xl ${className}`}
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  )
}

export const ServiceCardSkeleton = () => (
  <div className="glass-card p-5 space-y-3">
    <div className="h-40 rounded-xl shimmer-enhanced" />
    <div className="h-4 w-3/4 rounded-lg shimmer-enhanced" />
    <div className="h-3 w-full rounded-lg shimmer-enhanced" />
    <div className="flex gap-2">
      <div className="h-5 w-16 rounded-full shimmer-enhanced" />
      <div className="h-5 w-12 rounded-full shimmer-enhanced" />
    </div>
  </div>
)

export const SolicitudSkeleton = () => (
  <div className="glass-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 rounded shimmer-enhanced" />
      <div className="h-4 w-40 rounded-lg shimmer-enhanced" />
      <div className="ml-auto h-5 w-16 rounded-full shimmer-enhanced" />
    </div>
    <div className="h-3 w-3/4 rounded-lg ml-7 shimmer-enhanced" />
  </div>
)

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 rounded-2xl shimmer-enhanced" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-48 rounded-lg shimmer-enhanced" />
        <div className="h-4 w-64 rounded-lg shimmer-enhanced" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card p-4 space-y-2">
          <div className="h-3 w-16 rounded-lg shimmer-enhanced" />
          <div className="h-6 w-12 rounded-lg shimmer-enhanced" />
        </div>
      ))}
    </div>
    <div className="glass-card p-6 space-y-4">
      <div className="h-5 w-36 rounded-lg shimmer-enhanced" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 rounded-xl shimmer-enhanced" />
        <div className="h-10 rounded-xl shimmer-enhanced" />
      </div>
      <div className="h-10 rounded-xl shimmer-enhanced" />
    </div>
  </div>
)

export const StatCardSkeleton = () => (
  <div className="stat-card p-5 space-y-3" style={{ '--stat-color': 'var(--brand)' } as React.CSSProperties}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl shimmer-enhanced" />
      <div className="h-3 w-20 rounded-lg shimmer-enhanced" />
    </div>
    <div className="h-8 w-12 rounded-lg shimmer-enhanced" />
  </div>
)
