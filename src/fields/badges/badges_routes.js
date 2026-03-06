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
  getServicesByBadge
} from './badges_controller.js'
import { validateJWT } from '../../../middlewares/validate_jwt.js'
import { requireRole } from '../../../middlewares/validate_role.js'

const router = Router()

// obtener todas las badges
router.get('/', validateJWT, getBadges)

// obtener una badge por id
router.get('/:id', validateJWT, getBadge)

// listar servicios con una insignia específica
router.get('/:id/services', validateJWT, getServicesByBadge)

// crear badge (solo admin)
router.post('/', validateJWT, requireRole('ADMIN_ROLE'), createBadge)

// asignar insignia a servicio (solo admin)
router.post('/:id/assign', validateJWT, requireRole('ADMIN_ROLE'), assignBadgeToService)

// quitar insignia de servicio (solo admin)
router.delete('/:id/remove', validateJWT, requireRole('ADMIN_ROLE'), removeBadgeFromService)

// actualizar badge (solo admin)
router.put('/:id', validateJWT, requireRole('ADMIN_ROLE'), updateBadge)

// soft delete badge (solo admin)
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteBadge)

export default router