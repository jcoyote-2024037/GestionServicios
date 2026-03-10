'use strict'
import { Router } from 'express'
import {
  createBadge,
  getBadges,
  getBadge,
  updateBadge,
  deleteBadge,
  assignBadgeToService,
  removeBadgeFromService,
  getServicesByBadge,
  triggerAutoAssign,
  triggerAutoAssignAll,
  getProviderRanking
} from './badges_controller.js'
import { validateJWT } from '../../../middlewares/validate_jwt.js'
import { requireRole } from '../../../middlewares/validate_role.js'

const router = Router()

// ---------------------------------------------------------------------------
// RUTAS PUBLICAS CON JWT
// ---------------------------------------------------------------------------

// GET /badges
// Lista todas las insignias activas. Query opcional: ?badgeType=CALIFICACION
router.get('/', validateJWT, getBadges)

// GET /badges/ranking/providers
// Ranking de servicios por insignias. Query: ?limit=10
// IMPORTANTE: esta ruta debe ir ANTES de /:id para no confundirse con ese parametro
router.get('/ranking/providers', validateJWT, getProviderRanking)

// GET /badges/:id
// Detalle de una insignia por su ID
router.get('/:id', validateJWT, getBadge)

// GET /badges/:id/services
// Lista los servicios que tienen esa insignia
router.get('/:id/services', validateJWT, getServicesByBadge)

// ---------------------------------------------------------------------------
// RUTAS SOLO ADMIN
// ---------------------------------------------------------------------------

// POST /badges
// Crea una nueva insignia
router.post('/', validateJWT, requireRole('ADMIN_ROLE'), createBadge)

// POST /badges/auto-assign
// Dispara auto-asignacion para un servicio especifico. Body: { serviceId }
router.post('/auto-assign', validateJWT, requireRole('ADMIN_ROLE'), triggerAutoAssign)

// POST /badges/auto-assign/all
// Dispara auto-asignacion para todos los servicios activos
router.post('/auto-assign/all', validateJWT, requireRole('ADMIN_ROLE'), triggerAutoAssignAll)

// POST /badges/:id/assign
// Asigna manualmente una insignia a un servicio. Body: { serviceId }
router.post('/:id/assign', validateJWT, requireRole('ADMIN_ROLE'), assignBadgeToService)

// PUT /badges/:id
// Actualiza datos de una insignia
router.put('/:id', validateJWT, requireRole('ADMIN_ROLE'), updateBadge)

// DELETE /badges/:id/remove
// Quita una insignia de un servicio. Body: { serviceId }
router.delete('/:id/remove', validateJWT, requireRole('ADMIN_ROLE'), removeBadgeFromService)

// DELETE /badges/:id
// Soft delete de la insignia y la quita de todos los servicios
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteBadge)

export default router