export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-white/20 mb-4 text-5xl">{icon}</div>}
      <h3 className="text-white/60 text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-white/30 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
