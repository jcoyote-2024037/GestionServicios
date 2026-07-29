import { useState, useEffect, useRef } from 'react'

export const SearchBar = ({ onSearch, placeholder = 'Buscar...', debounceMs = 300 }) => {
  const [value, setValue] = useState('')
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      onSearch(value)
    }, debounceMs)
    return () => clearTimeout(timeoutRef.current)
  }, [value, debounceMs, onSearch])

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/7 transition-all"
      />
    </div>
  )
}
