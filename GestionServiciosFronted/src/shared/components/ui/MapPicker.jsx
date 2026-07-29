import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [14.6349, -90.5069]
const DEFAULT_ZOOM = 12

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export const MapPicker = ({ lat = DEFAULT_CENTER[0], lng = DEFAULT_CENTER[1], onLocationChange, className = '' }) => {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
    markerRef.current = marker

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onLocationChange?.(pos.lat, pos.lng)
    })

    map.on('click', (e) => {
      marker.setLatLng(e.latlng)
      onLocationChange?.(e.latlng.lat, e.latlng.lng)
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const marker = markerRef.current
    if (marker && (lat !== marker.getLatLng().lat || lng !== marker.getLatLng().lng)) {
      marker.setLatLng([lat, lng])
      mapInstanceRef.current?.setView([lat, lng])
    }
  }, [lat, lng])

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs text-white/40 mb-1">Ubicación en el mapa</label>
      <p className="text-[10px] text-white/20 mb-1">Arrastra el marcador o haz clic en el mapa para ajustar la ubicación</p>
      <div ref={mapRef} className="w-full h-[300px] rounded-xl overflow-hidden border border-white/10" style={{ zIndex: 1 }} />
      <div className="flex gap-4 text-xs text-white/40">
        <span>Lat: {typeof lat === 'number' ? lat.toFixed(6) : '-'}</span>
        <span>Lng: {typeof lng === 'number' ? lng.toFixed(6) : '-'}</span>
      </div>
    </div>
  )
}
