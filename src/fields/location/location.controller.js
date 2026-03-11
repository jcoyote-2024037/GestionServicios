'use strict'
import Location from './location.model.js'
import Service  from '../services/services.model.js'

// ── Utilidades ─────────────────────────────────────────────────────────────────

// Distancia en metros entre dos puntos (fórmula Haversine)
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6_371_000
    const toRad = deg => (deg * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Normaliza texto: minúsculas y sin espacios sobrantes
const normalize = str => (str ? str.trim().toLowerCase() : str)

// ── CRUD ───────────────────────────────────────────────────────────────────────

export const createLocation = async (req, res) => {
    try {
        const {
            name, address, municipality, department,
            zona, country, postalCode, lat, lng, geohash, population
        } = req.body

        // Duplicado por nombre + municipio + departamento
        const existsByData = await Location.findOne({
            name:         normalize(name),
            municipality: normalize(municipality),
            department:   normalize(department),
            address
        })
        if (existsByData) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una ubicación con esos datos exactos.'
            })
        }

        // Evitar ubicaciones a menos de 10 metros entre sí
        if (lat !== undefined && lng !== undefined) {
            const nearby = await Location.find({
                lat: { $gte: lat - 0.001, $lte: lat + 0.001 },
                lng: { $gte: lng - 0.001, $lte: lng + 0.001 },
                status: true
            })
            const tooClose = nearby.find(
                loc => haversineDistance(lat, lng, loc.lat, loc.lng) < 10
            )
            if (tooClose) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe una ubicación a menos de 10 metros de esas coordenadas.'
                })
            }
        }

        const location = new Location({
            name:         normalize(name),
            address,
            municipality: normalize(municipality),
            department:   normalize(department),
            zona:         zona    ? normalize(zona)    : undefined,
            country:      country ? normalize(country) : undefined,
            postalCode,
            lat,
            lng,
            geohash,
            population
        })
        await location.save()

        res.status(201).json({
            success: true,
            message: 'Ubicación creada exitosamente.',
            data: location
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getLocations = async (req, res) => {
    try {
        const { municipality, department, country, zona } = req.query
        const filter = { status: true }

        if (municipality) filter.municipality = { $regex: municipality, $options: 'i' }
        if (department)   filter.department   = { $regex: department,   $options: 'i' }
        if (country)      filter.country      = { $regex: country,      $options: 'i' }
        if (zona)         filter.zona         = { $regex: zona,         $options: 'i' }

        const locations = await Location.find(filter)
        res.status(200).json({ success: true, data: locations })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id)

        if (!location || !location.status) {
            return res.status(404).json({
                success: false,
                message: 'Ubicación no encontrada.'
            })
        }

        res.status(200).json({ success: true, data: location })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const updateLocation = async (req, res) => {
    try {
        const fieldsToNormalize = ['name', 'municipality', 'department', 'country', 'zona']
        fieldsToNormalize.forEach(f => {
            if (req.body[f]) req.body[f] = normalize(req.body[f])
        })

        const location = await Location.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Ubicación no encontrada.'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Ubicación actualizada correctamente.',
            data: location
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(
            req.params.id,
            { status: false },
            { new: true }
        )

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Ubicación no encontrada.'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Ubicación eliminada correctamente.'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// ── Lógica adicional ───────────────────────────────────────────────────────────

// Distancia entre dos ubicaciones: GET /api/locations/distance?from=<id>&to=<id>
export const getDistance = async (req, res) => {
    try {
        const { from, to } = req.query
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los parámetros from y to.'
            })
        }

        const [locA, locB] = await Promise.all([
            Location.findById(from),
            Location.findById(to)
        ])

        if (!locA || !locB) {
            return res.status(404).json({
                success: false,
                message: 'Una o ambas ubicaciones no fueron encontradas.'
            })
        }

        if (locA.lat == null || locB.lat == null) {
            return res.status(400).json({
                success: false,
                message: 'Una o ambas ubicaciones no tienen coordenadas registradas.'
            })
        }

        const meters = haversineDistance(locA.lat, locA.lng, locB.lat, locB.lng)

        res.status(200).json({
            success: true,
            data: {
                from:          { id: locA._id, name: locA.name },
                to:            { id: locB._id, name: locB.name },
                distanceMeters: Math.round(meters),
                distanceKm:     parseFloat((meters / 1000).toFixed(3))
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Centro geográfico de una zona: GET /api/locations/:id/geographic-center
export const getGeographicCenter = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id)
        if (!location || !location.status) {
            return res.status(404).json({ success: false, message: 'Ubicación no encontrada.' })
        }

        const siblings = await Location.find({
            status: true,
            municipality: location.municipality,
            lat: { $exists: true },
            lng: { $exists: true }
        })

        if (siblings.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay ubicaciones con coordenadas en esta zona.',
                center: null
            })
        }

        const avgLat = siblings.reduce((sum, l) => sum + l.lat, 0) / siblings.length
        const avgLng = siblings.reduce((sum, l) => sum + l.lng, 0) / siblings.length

        res.status(200).json({
            success: true,
            data: {
                municipality:   location.municipality,
                totalLocations: siblings.length,
                center:         { lat: avgLat, lng: avgLng }
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Densidad de servicios por zona: GET /api/locations/zone-density
export const getZoneDensity = async (req, res) => {
    try {
        const locations = await Location.find({ status: true })

        const zones = await Promise.all(locations.map(async (loc) => {
            const services = await Service.find({ 
                locationId: loc._id, 
                estado: 'activo' 
            })
            .populate('categoriaId', 'name')
            .populate('tags', 'name slug')

            const count = services.length
            let density = 'sin_servicios'
            if (count >= 10)     density = 'alta'
            else if (count >= 4) density = 'media'
            else if (count >= 1) density = 'baja'

            return {
                locationId:          loc._id,
                municipality:        loc.municipality,
                department:          loc.department,
                serviceCount:        count,
                density,
                highDemandLowSupply: (loc.population || 0) > 10000 && count < 4,
                services:            services.map(s => ({
                    id:       s._id,
                    nombre:   s.nombre,
                    categoria: s.categoriaId,
                    tags:     s.tags
                }))
            }
        }))

        zones.sort((a, b) => b.serviceCount - a.serviceCount)

        res.status(200).json({ success: true, data: zones })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}