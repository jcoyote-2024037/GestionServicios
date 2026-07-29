import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { servicesService } from '../../../shared/api/services/servicesService'
import { categoriesService } from '../../../shared/api/services/categoriesService'
import { adminService } from '../../../shared/api/services/adminService'
import { favoritesService } from '../../../shared/api/services/favoritesService'
import { SearchBar } from '../../../shared/components/ui/SearchBar'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { EmptyState } from '../../../shared/components/ui/EmptyState'
import { Pagination } from '../../../shared/components/ui/Pagination'
import { ServiceCard } from '../../../shared/components/ui/ServiceCard'
import { ServiceCardSkeleton } from '../../../shared/components/ui/Skeleton'
import { useAuth } from '../../../shared/hooks/useAuth'

const PAGE_SIZE = 12

const catIcons = {
  limpieza: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  reparaci: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  salud: 'M4.5 12.75l6 6 9-13.5',
  educaci: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422m-6.16 3.422L5.84 10.578M12 14l6.16-3.422M12 14v5.578M12 19.578L5.84 16.422M12 19.578l6.16-3.422',
  tecno: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  trans: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  hogar: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  belle: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  comid: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  masc: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5m0 0H8m6 0h4M7 20l-2.46-1.23A2 2 0 013 16.998V14.5a.5.5 0 01.5-.5h1.5M7 20v-6',
  default: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
}

export const ServicesPage = () => {
  const [allServices, setAllServices] = useState([])
  const [nearbyServices, setNearbyServices] = useState([])
  const [featuredServices, setFeaturedServices] = useState([])
  const [popularServices, setPopularServices] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const { user, isUser, isAdmin, isDueno } = useAuth()
  const canCreate = isAdmin || isDueno
  const navigate = useNavigate()
  const featuredRef = useRef(null)
  const [scrollPos, setScrollPos] = useState(0)

  const hasLocation = user?.municipality || user?.department || user?.zona

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const [allRes, featuredRes, popularRes] = await Promise.all([
        servicesService.getAll(),
        servicesService.getFeatured().catch(() => ({ data: { services: [] } })),
        servicesService.getPopular().catch(() => ({ data: { services: [] } })),
      ])

      const { data: allData } = allRes
      setAllServices(allData.services || allData.data || (Array.isArray(allData) ? allData : []))

      const fData = featuredRes.data
      setFeaturedServices(fData?.services || fData?.data || (Array.isArray(fData) ? fData : []))

      const pData = popularRes.data
      setPopularServices(pData?.services || pData?.data || (Array.isArray(pData) ? pData : []))

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
    adminService.getTags().then(({ data }) => {
      setTags(data.tags || data.data || (Array.isArray(data) ? data : []))
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
    if (selectedTag) {
      result = result.filter((s) =>
        s.tags?.some(t => (t._id || t) === selectedTag)
      )
    }
    return result
  }, [allServices, search, selectedCategory, selectedTag])

  const otherServices = useMemo(() => {
    return filteredServices.filter(s => !nearbyIds.has(s._id || s.id))
  }, [filteredServices, nearbyIds])

  const groupedNearby = useMemo(() => {
    if (!search && !selectedCategory && !selectedTag) return nearbyServices
    return nearbyServices.filter(s => {
      const q = search?.toLowerCase()
      if (q) {
        const match = s.nombre?.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q)
        if (!match) return false
      }
      if (selectedCategory) {
        if ((s.categoriaId?._id || s.categoriaId) !== selectedCategory) return false
      }
      if (selectedTag) {
        if (!s.tags?.some(t => (t._id || t) === selectedTag)) return false
      }
      return true
    })
  }, [nearbyServices, search, selectedCategory, selectedTag])

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

  const getCatIcon = (name) => {
    const n = (name || '').toLowerCase()
    for (const [key, path] of Object.entries(catIcons)) {
      if (n.includes(key)) return path
    }
    return catIcons.default
  }

  const scrollFeatured = (dir) => {
    if (!featuredRef.current) return
    const amount = 380
    featuredRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-white/40 text-sm mt-1">Explora todos los servicios disponibles</p>
        </div>
        {canCreate && (
          <button onClick={() => navigate('/services/new')}
            className="glass-btn w-auto px-5 py-2.5 text-sm">
            + Nuevo Servicio
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar servicios..." />
        </div>
        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
          className="glass-input w-auto min-w-[160px]">
          <option value="">Categorías</option>
          {categories.map((cat) => (
            <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.nombre}</option>
          ))}
        </select>
        {tags.length > 0 && (
          <select value={selectedTag} onChange={(e) => { setSelectedTag(e.target.value); setPage(1) }}
            className="glass-input w-auto min-w-[140px]">
            <option value="">Tags</option>
            {tags.map((tag) => (
              <option key={tag._id || tag.id} value={tag._id || tag.id}>{tag.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
              !selectedCategory
                ? 'text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
            style={!selectedCategory ? { background: 'linear-gradient(135deg, var(--brand), var(--accent))' } : {}}
          >
            Todos
          </button>
          {categories.map((cat) => {
            const isActive = (cat._id || cat.id) === selectedCategory
            return (
              <button
                key={cat._id || cat.id}
                onClick={() => setSelectedCategory(isActive ? '' : cat._id || cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                }`}
                style={isActive ? { background: 'linear-gradient(135deg, var(--brand), var(--accent))' } : {}}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getCatIcon(cat.nombre)} />
                </svg>
                {cat.nombre}
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}><ServiceCardSkeleton /></div>)}
        </div>
      ) : (
        <>
          {/* Featured - Horizontal Scroll */}
          {!search && !selectedCategory && !selectedTag && featuredServices.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  Destacados
                </h2>
                <div className="flex gap-1">
                  <button onClick={() => scrollFeatured(-1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => scrollFeatured(1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
              <div ref={featuredRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {featuredServices.slice(0, 10).map((service, i) => (
                  <div key={service._id || service.id} className="snap-start flex-shrink-0 w-[300px] sm:w-[340px] animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <ServiceCard service={service} onFavorite={handleToggleFavorite} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular */}
          {!search && !selectedCategory && !selectedTag && popularServices.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Más populares
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularServices.slice(0, 6).map((service, i) => (
                  <div key={service._id || service.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ServiceCard service={service} onFavorite={handleToggleFavorite} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby */}
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
                {groupedNearby.map((service, i) => (
                  <div key={service._id || service.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ServiceCard service={service} onFavorite={handleToggleFavorite} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All services */}
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
                  {paginatedServices.map((service, i) => (
                    <div key={service._id || service.id} className="animate-fade-in" style={{ animationDelay: `${(i % 6) * 0.05}s` }}>
                      <ServiceCard
                        service={service}
                        onFavorite={handleToggleFavorite}
                      />
                    </div>
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
