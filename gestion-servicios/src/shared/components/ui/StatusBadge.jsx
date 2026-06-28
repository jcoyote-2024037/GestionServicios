const STATUS_MAP = {
  pending:   { label: 'Pendiente',  cls: 'badge-pending' },
  accepted:  { label: 'Aceptada',   cls: 'badge-accepted' },
  rejected:  { label: 'Rechazada',  cls: 'badge-rejected' },
  completed: { label: 'Completada', cls: 'badge-completed' },
  cancelled: { label: 'Cancelada',  cls: 'badge-cancelled' },
}

export const StatusBadge = ({ status }) => {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'badge-cancelled' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
