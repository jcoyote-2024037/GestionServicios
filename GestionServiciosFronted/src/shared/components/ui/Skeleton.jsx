export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-xl animate-pulse ${className}`}
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
    <div className="h-40 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
    <div className="h-4 w-3/4 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
    <div className="h-3 w-full rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
    <div className="flex gap-2">
      <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="h-5 w-12 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  </div>
)
