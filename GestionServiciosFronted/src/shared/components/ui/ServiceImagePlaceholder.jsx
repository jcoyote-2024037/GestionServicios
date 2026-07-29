const palette = [
  { from: '#f43f5e', to: '#ec4899', glow: 'rgba(244,63,94,0.3)' },
  { from: '#8b5cf6', to: '#6366f1', glow: 'rgba(139,92,246,0.3)' },
  { from: '#06b6d4', to: '#0ea5e9', glow: 'rgba(6,182,212,0.3)' },
  { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.3)' },
  { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.3)' },
  { from: '#ec4899', to: '#f43f5e', glow: 'rgba(236,72,153,0.3)' },
  { from: '#6366f1', to: '#8b5cf6', glow: 'rgba(99,102,241,0.3)' },
  { from: '#14b8a6', to: '#10b981', glow: 'rgba(20,184,166,0.3)' },
]

const iconMap = {
  default: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  limpieza: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  reparacion: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  salud: 'M4.5 12.75l6 6 9-13.5',
  educacion: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422m-6.16 3.422L5.84 10.578M12 14l6.16-3.422M12 14v5.578M12 19.578L5.84 16.422M12 19.578l6.16-3.422',
  tecnologia: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  transporte: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  hogar: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  belleza: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  comida: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  mascotas: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5m0 0H8m6 0h4M7 20l-2.46-1.23A2 2 0 013 16.998V14.5a.5.5 0 01.5-.5h1.5M7 20v-6',
}

export const ServiceImagePlaceholder = ({ nombre = 'Servicio', categoria, size = 'full' }) => {
  const catLower = (categoria || '').toLowerCase()
  let colorIndex = 0
  if (catLower.includes('limp') || catLower.includes('aseo')) colorIndex = 3
  else if (catLower.includes('repar') || catLower.includes('manten') || catLower.includes('electric') || catLower.includes('fontan')) colorIndex = 1
  else if (catLower.includes('salud') || catLower.includes('medic')) colorIndex = 2
  else if (catLower.includes('educ') || catLower.includes('clase') || catLower.includes('tutor')) colorIndex = 4
  else if (catLower.includes('tecno') || catLower.includes('inform') || catLower.includes('program') || catLower.includes('web')) colorIndex = 5
  else if (catLower.includes('trans') || catLower.includes('envio') || catLower.includes('mudan')) colorIndex = 6
  else if (catLower.includes('hogar') || catLower.includes('jardin') || catLower.includes('pint')) colorIndex = 7
  else if (catLower.includes('belle') || catLower.includes('peluq') || catLower.includes('spa') || catLower.includes('estet')) colorIndex = 0
  else if (catLower.includes('comid') || catLower.includes('cocin') || catLower.includes('cater')) colorIndex = 4
  else if (catLower.includes('masc') || catLower.includes('veter') || catLower.includes('pase')) colorIndex = 3
  else colorIndex = nombre.length % palette.length

  const colors = palette[colorIndex]
  const initial = (nombre || 'S').charAt(0).toUpperCase()
  let matchedIcon = iconMap.default
  for (const [key, path] of Object.entries(iconMap)) {
    if (catLower.includes(key)) { matchedIcon = path; break }
  }

  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    full: 'w-full h-full',
  }

  return (
    <div className={`${sizeMap[size] || sizeMap.full} relative overflow-hidden rounded-xl`}>
      <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
        <defs>
          <linearGradient id={`grad-${colorIndex}-${initial}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colors.to} stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`glow-${colorIndex}-${initial}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={colors.glow} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill={`url(#grad-${colorIndex}-${initial})`} rx="16" />
        <rect width="200" height="200" fill={`url(#glow-${colorIndex}-${initial})`} rx="16" />
        <circle cx="160" cy="40" r="60" fill="rgba(255,255,255,0.06)" />
        <circle cx="40" cy="170" r="50" fill="rgba(255,255,255,0.04)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <svg className="w-10 h-10 text-white/30 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d={matchedIcon} />
        </svg>
        <span className="text-white/60 text-2xl font-bold tracking-tight drop-shadow-sm">{initial}</span>
      </div>
    </div>
  )
}
