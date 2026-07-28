import { Spinner } from './Spinner'
import { Pagination } from './Pagination'
import { EmptyState } from './EmptyState'

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  emptyTitle = 'No hay datos',
  emptyDescription = 'No se encontraron registros',
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="md" />
      </div>
    )
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider"
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row._id || row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-white/70">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onPageChange && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  )
}
