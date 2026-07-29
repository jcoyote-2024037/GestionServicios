export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Anterior
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-8 h-8 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            1
          </button>
          {start > 2 && <span className="text-white/30">...</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-sm transition-all ${
            page === currentPage
              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          {page}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-white/30">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Siguiente
      </button>
    </div>
  )
}
