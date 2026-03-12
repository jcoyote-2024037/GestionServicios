'use strict'
import Badge, { BADGE_TYPES } from './badges_model.js'
import Service from '../services/services.model.js'
import Solicitud from '../solicitudes/solicitudes.model.js'

// ---------------------------------------------------------------------------
// HELPERS INTERNOS
// ---------------------------------------------------------------------------

/**
 * Valida que el objeto criteria tenga la estructura correcta segun el badgeType.
 * Retorna null si es valido, o un string con el mensaje de error.
 *
 * CALIFICACION  -> { minRating: Number entre 0 y 5 }
 * SOLICITUDES   -> { minCompleted: Number entero positivo }
 * VERIFICADO    -> { manual: true }
 * RECOMENDADO   -> { minFavoritos: Number entero positivo }
 */
const validateCriteriaStructure = (badgeType, criteria) => {
  if (typeof criteria !== 'object' || Array.isArray(criteria) || criteria === null) {
    return 'El campo criteria debe ser un objeto JSON valido.'
  }
  switch (badgeType) {
    case 'CALIFICACION':
      if (criteria.minRating === undefined || typeof criteria.minRating !== 'number')
        return 'Para CALIFICACION, criteria debe tener { minRating: Number }.'
      if (criteria.minRating < 0 || criteria.minRating > 5)
        return 'minRating debe estar entre 0 y 5.'
      break
    case 'SOLICITUDES':
      if (criteria.minCompleted === undefined || !Number.isInteger(criteria.minCompleted) || criteria.minCompleted < 1)
        return 'Para SOLICITUDES, criteria debe tener { minCompleted: Number entero positivo }.'
      break
    case 'VERIFICADO':
      if (criteria.manual !== true)
        return 'Para VERIFICADO, criteria debe ser { manual: true }.'
      break
    case 'RECOMENDADO':
      if (criteria.minFavoritos === undefined || !Number.isInteger(criteria.minFavoritos) || criteria.minFavoritos < 1)
        return 'Para RECOMENDADO, criteria debe tener { minFavoritos: Number entero positivo }.'
      break
    default:
      return `badgeType invalido. Valores permitidos: ${BADGE_TYPES.join(', ')}.`
  }
  return null
}

/**
 * Evalua si un servicio cumple el criterio de una insignia.
 * Retorna true si cumple. Se usa internamente para auto-asignacion.
 */
const servicePassesCriteria = async (service, badge) => {
  const { criteria, badgeType } = badge
  switch (badgeType) {
    case 'CALIFICACION':
      return service.promedioCalificacion >= criteria.minRating
    case 'SOLICITUDES': {
      const completedCount = await Solicitud.countDocuments({ servicioId: service._id, estado: 'completado' })
      return completedCount >= criteria.minCompleted
    }
    case 'VERIFICADO':
      return false // siempre manual
    case 'RECOMENDADO':
      return service.favoritosCount >= criteria.minFavoritos
    default:
      return false
  }
}

/**
 * Funcion interna reutilizable: recorre todas las insignias con autoAssign=true
 * y para el servicio dado asigna las que cumplen criterio y revoca las que no.
 * Tambien limpia insignias expiradas.
 * Retorna { assigned: [], revoked: [], expired: [] }
 */
export const runAutoAssignForService = async (service) => {
  const autoBadges = await Badge.find({ autoAssign: true, status: true })
  const assigned = []
  const revoked = []
  const expired = []
  const now = new Date()

  for (const badge of autoBadges) {
    const hasBadge = service.badges.some(b => b.toString() === badge._id.toString())

    if (badge.expiresAt && badge.expiresAt < now) {
      if (hasBadge) {
        service.badges = service.badges.filter(b => b.toString() !== badge._id.toString())
        expired.push(badge.name)
      }
      continue
    }

    const passes = await servicePassesCriteria(service, badge)
    if (passes && !hasBadge) {
      service.badges.push(badge._id)
      assigned.push(badge.name)
    } else if (!passes && hasBadge) {
      service.badges = service.badges.filter(b => b.toString() !== badge._id.toString())
      revoked.push(badge.name)
    }
  }

  await service.save()
  return { assigned, revoked, expired }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

// POST /badges
export const createBadge = async (req, res) => {
  try {
    const { name, description, criteria, badgeType, icon, priority, autoAssign, expiresAt } = req.body

    if (!badgeType || !BADGE_TYPES.includes(badgeType)) {
      return res.status(400).json({ success: false, message: `badgeType es obligatorio. Valores permitidos: ${BADGE_TYPES.join(', ')}.` })
    }

    const criteriaError = validateCriteriaStructure(badgeType, criteria)
    if (criteriaError) return res.status(400).json({ success: false, message: criteriaError })

    const exists = await Badge.findOne({ name, status: true })
    if (exists) return res.status(409).json({ success: false, message: 'Ya existe una insignia activa con ese nombre.' })

    if (expiresAt && isNaN(new Date(expiresAt).getTime())) {
      return res.status(400).json({ success: false, message: 'expiresAt no es una fecha valida.' })
    }

    const badge = new Badge({ name, description, criteria, badgeType, icon, priority, autoAssign, expiresAt })
    await badge.save()

    res.status(201).json({ success: true, message: 'Insignia creada exitosamente.', data: badge })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /badges
export const getBadges = async (req, res) => {
  try {
    const filter = { status: true }
    if (req.query.badgeType) {
      if (!BADGE_TYPES.includes(req.query.badgeType)) {
        return res.status(400).json({ success: false, message: `badgeType invalido. Valores permitidos: ${BADGE_TYPES.join(', ')}.` })
      }
      filter.badgeType = req.query.badgeType
    }
    const badges = await Badge.find(filter).sort({ priority: -1 })
    res.status(200).json({ success: true, total: badges.length, data: badges })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /badges/:id
export const getBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id)
    if (!badge || !badge.status) return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })
    res.status(200).json({ success: true, data: badge })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /badges/:id
export const updateBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id)
    if (!badge || !badge.status) return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })

    const { criteria, badgeType, expiresAt, name } = req.body

    if (name && name !== badge.name) {
      const exists = await Badge.findOne({ name, status: true })
      if (exists) return res.status(409).json({ success: false, message: 'Ya existe una insignia activa con ese nombre.' })
    }

    const finalType = badgeType || badge.badgeType
    const finalCriteria = criteria !== undefined ? criteria : badge.criteria

    if (criteria !== undefined || badgeType !== undefined) {
      const criteriaError = validateCriteriaStructure(finalType, finalCriteria)
      if (criteriaError) return res.status(400).json({ success: false, message: criteriaError })
    }

    if (expiresAt && isNaN(new Date(expiresAt).getTime())) {
      return res.status(400).json({ success: false, message: 'expiresAt no es una fecha valida.' })
    }

    const updated = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.status(200).json({ success: true, message: 'Insignia actualizada correctamente.', data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /badges/:id
export const deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, { status: false }, { new: true })
    if (!badge) return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })

    // La quita de todos los servicios que la tenian
    await Service.updateMany({ badges: badge._id }, { $pull: { badges: badge._id } })

    res.status(200).json({ success: true, message: 'Insignia eliminada y removida de todos los servicios.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ---------------------------------------------------------------------------
// ASIGNACION MANUAL
// ---------------------------------------------------------------------------

// POST /badges/:id/assign
// Body: { serviceId }
export const assignBadgeToService = async (req, res) => {
  try {
    const { serviceId } = req.body
    if (!serviceId) return res.status(400).json({ success: false, message: 'serviceId es obligatorio.' })

    const badge = await Badge.findById(req.params.id)
    if (!badge || !badge.status) return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })

    if (badge.expiresAt && badge.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'No se puede asignar una insignia expirada.' })
    }

    const service = await Service.findById(serviceId).populate('badges')
    if (!service || service.estado === 'inactivo') {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado o inactivo.' })
    }

    if (service.badges.some(b => b._id.toString() === badge._id.toString())) {
      return res.status(409).json({ success: false, message: 'El servicio ya tiene esta insignia.' })
    }

    if (service.badges.some(b => b.badgeType === badge.badgeType)) {
      return res.status(409).json({
        success: false,
        message: `El servicio ya tiene una insignia de tipo ${badge.badgeType}. Quite la anterior antes de asignar una nueva del mismo tipo.`
      })
    }

    service.badges.push(badge._id)
    await service.save()

    const updated = await Service.findById(serviceId).populate('badges')
    res.status(200).json({ success: true, message: 'Insignia asignada al servicio correctamente.', data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /badges/:id/remove
// Body: { serviceId }
export const removeBadgeFromService = async (req, res) => {
  try {
    const { serviceId } = req.body
    if (!serviceId) return res.status(400).json({ success: false, message: 'serviceId es obligatorio.' })

    const service = await Service.findById(serviceId)
    if (!service || service.estado === 'inactivo') {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado o inactivo.' })
    }

    if (!service.badges.some(b => b.toString() === req.params.id)) {
      return res.status(404).json({ success: false, message: 'El servicio no tiene esa insignia.' })
    }

    service.badges = service.badges.filter(b => b.toString() !== req.params.id)
    await service.save()

    res.status(200).json({ success: true, message: 'Insignia removida del servicio correctamente.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ---------------------------------------------------------------------------
// ASIGNACION AUTOMATICA
// ---------------------------------------------------------------------------

// POST /badges/auto-assign
// Body: { serviceId }
// Dispara evaluacion automatica para un servicio especifico.
// Solo evalua insignias con autoAssign=true.
export const triggerAutoAssign = async (req, res) => {
  try {
    const { serviceId } = req.body
    if (!serviceId) return res.status(400).json({ success: false, message: 'serviceId es obligatorio.' })

    const service = await Service.findById(serviceId)
    if (!service || service.estado === 'inactivo') {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado o inactivo.' })
    }

    const result = await runAutoAssignForService(service)
    const updatedService = await Service.findById(serviceId).populate('badges')

    res.status(200).json({
      success: true,
      message: 'Evaluacion automatica completada.',
      changes: result,
      data: updatedService
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /badges/auto-assign/all
// Dispara evaluacion automatica para TODOS los servicios activos.
// Retorna solo los servicios que tuvieron cambios.
export const triggerAutoAssignAll = async (req, res) => {
  try {
    const services = await Service.find({ estado: 'activo' })
    const summary = []

    for (const service of services) {
      const result = await runAutoAssignForService(service)
      if (result.assigned.length > 0 || result.revoked.length > 0 || result.expired.length > 0) {
        summary.push({ serviceId: service._id, nombre: service.nombre, ...result })
      }
    }

    res.status(200).json({
      success: true,
      message: `Evaluacion completada para ${services.length} servicios.`,
      servicesWithChanges: summary.length,
      data: summary
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ---------------------------------------------------------------------------
// CONSULTAS
// ---------------------------------------------------------------------------

// GET /badges/:id/services
// Lista todos los servicios activos que tienen una insignia especifica.
export const getServicesByBadge = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id)
    if (!badge || !badge.status) return res.status(404).json({ success: false, message: 'Insignia no encontrada.' })

    const services = await Service.find({ badges: badge._id, estado: 'activo' }).populate('badges')
    res.status(200).json({ success: true, total: services.length, data: services })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /badges/ranking/providers
// Devuelve los servicios ordenados por la suma de priority de sus insignias activas.
// Query: ?limit=10 (max 50)
export const getProviderRanking = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50)

    const services = await Service.find({ estado: 'activo', 'badges.0': { $exists: true } }).populate('badges')
    const now = new Date()

    const scored = services.map(service => {
      const activeBadges = service.badges.filter(b => b.status && (!b.expiresAt || b.expiresAt >= now))
      const score = activeBadges.reduce((sum, b) => sum + (b.priority || 1), 0)

      return {
        serviceId: service._id,
        nombre: service.nombre,
        promedioCalificacion: service.promedioCalificacion,
        totalBadges: activeBadges.length,
        rankingScore: score,
        badges: activeBadges.map(b => ({ name: b.name, badgeType: b.badgeType, priority: b.priority, icon: b.icon }))
      }
    })

    scored.sort((a, b) => b.rankingScore - a.rankingScore || b.promedioCalificacion - a.promedioCalificacion)

    res.status(200).json({ success: true, total: scored.length, data: scored.slice(0, limit) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}