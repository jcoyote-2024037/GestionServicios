import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const DEFAULT_CENTER = [14.6349, -90.5069]
const DEFAULT_ZOOM = 14

export const StaticMap = ({ lat, lng, label, className = '', height = '200px' }) => {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)

  const hasCoords = typeof lat === 'number' && typeof lng === 'number'

  useEffect(() => {
    if (instanceRef.current) return
    if (!hasCoords) return

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker([lat, lng]).addTo(map)
    if (label) {
      marker.bindPopup(label)
    }

    instanceRef.current = map

    return () => {
      map.remove()
      instanceRef.current = null
    }
  }, [hasCoords])

  if (!hasCoords) {
    return (
      <div className={`rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-white/20 text-xs">Sin ubicación disponible</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs text-white/40">Ubicación</label>
      <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-white/10" style={{ height, zIndex: 1 }} />
      <p className="text-[10px] text-white/20">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
    </div>
  )
}
