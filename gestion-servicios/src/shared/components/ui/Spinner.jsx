export const Spinner = ({ size = 'md', center = false }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const el = (
    <div
      className={`${sizes[size]} border-2 border-t-transparent rounded-full animate-spin`}
      style={{ borderColor: 'var(--gray-5)', borderTopColor: 'var(--navy)' }}
    />
  )
  if (center) return <div className="flex justify-center items-center py-16">{el}</div>
  return el
}
