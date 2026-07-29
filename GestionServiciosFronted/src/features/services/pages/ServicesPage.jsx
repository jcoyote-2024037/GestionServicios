import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { servicesService } from '../../../shared/api/services/servicesService'
import { categoriesService } from '../../../shared/api/services/categoriesService'
import { favoritesService } from '../../../shared/api/services/favoritesService'
import { SearchBar } from '../../../shared/components/ui/SearchBar'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { ServiceCard } from '../../../shared/components/ui/ServiceCard'
import { ServiceCardSkeleton } from '../../../shared/components/ui/Skeleton'
import { useAuth } from '../../../shared/hooks/useAuth'

const PAGE_SIZE = 12

export const ServicesPage = () => {
  const [allServices, setAllServices] = useState([])
  const [nearbyServices, setNearbyServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { user, isUser, isAdmin, isDueno } = useAuth()
  const canCreate = isAdmin || isDueno
  const navigate = useNavigate()

  const hasLocation = user?.municipality || user?.department || user?.zona

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const allRes = await servicesService.getAll()
      const { data: allData } = allRes
      setAllServices(allData.services || allData.data || (Array.isArray(allData) ? allData : []))

      if (isUser && hasLocation) {
        const nearbyRes = await servicesService.getNearby().catch(() => ({ data: { services: [] } }))
        setNearbyServices(nearbyRes.data.services || nearbyRes.data.data || [])
      } else {
        setNearbyServices([])
      }
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }, [isUser, hasLocation])

  useEffect(() => { fetchServices() }, [fetchServices])

  useEffect(() => {
    categoriesService.getActive().then(({ data }) => {
      setCategories(data.categories || data.data || (Array.isArray(data) ? data : []))
    }).catch(() => {})
  }, [])

  const nearbyIds = useMemo(() => {
    const ids = new Set()
    nearbyServices.forEach(s => ids.add(s._id || s.id))
    return ids
  }, [nearbyServices])

  const filteredServices = useMemo(() => {
    let result = allServices
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((s) =>
        s.nombre?.toLowerCase().includes(q) ||
        s.descripcion?.toLowerCase().includes(q)
      )
    }
    if (selectedCategory) {
      result = result.filter((s) => (s.categoriaId?._id || s.categoriaId) === selectedCategory)
    }
    return result
  }, [allServices, search, selectedCategory])

  const otherServices = useMemo(() => {
    return filteredServices.filter(s => !nearbyIds.has(s._id || s.id))
  }, [filteredServices, nearbyIds])

  const groupedNearby = useMemo(() => {
    if (!search && !selectedCategory) return nearbyServices
    return nearbyServices.filter(s => {
      const q = search?.toLowerCase()
      if (q) {
        const match = s.nombre?.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q)
        if (!match) return false
      }
      if (selectedCategory) {
        return (s.categoriaId?._id || s.categoriaId) === selectedCategory
      }
      return true
    })
  }, [nearbyServices, search, selectedCategory])

  const showNearby = isUser && hasLocation && groupedNearby.length > 0

  const totalPages = Math.max(1, Math.ceil(otherServices.length / PAGE_SIZE))
  const paginatedServices = otherServices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleToggleFavorite = async (service) => {
    try {
      await favoritesService.create({ servicioId: service._id || service.id })
      toast.success('Agregado a favoritos')
    } catch {
      toast.error('Error al agregar favorito')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-white/40 text-sm mt-1">Explora todos los servicios disponibles</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/services/new')}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}
          >
            + Nuevo Servicio
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar servicios..." />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
          className="glass-input w-auto min-w-[180px]"
        >
          <option value="" className="bg-[#111928]">Todas las categorias</option>
          {categories.map((cat) => (
            <option key={cat._id || cat.id} value={cat._id || cat.id} className="bg-[#111928]">
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {showNearby && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cerca de mí
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedNearby.map((service) => (
                  <ServiceCard
                    key={service._id || service.id}
                    service={service}
                    onFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              {showNearby ? 'Todos los servicios' : 'Servicios disponibles'}
            </h2>
            {!paginatedServices.length && !showNearby ? (
              <EmptyState
                title="No hay servicios"
                description="No se encontraron servicios con los filtros aplicados"
                action={canCreate && (
                  <button onClick={() => navigate('/services/new')} className="glass-btn w-auto px-6">
                    Crear Primer Servicio
                  </button>
                )}
              />
            ) : paginatedServices.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedServices.map((service) => (
                    <ServiceCard
                      key={service._id || service.id}
                      service={service}
                      onFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}