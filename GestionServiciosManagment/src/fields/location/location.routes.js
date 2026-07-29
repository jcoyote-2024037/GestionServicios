'use strict'
import { Router } from 'express'
import {
    createLocation,
    getLocations,
    getLocation,
    updateLocation,
    deleteLocation,
    getGeographicCenter,
    getZoneDensity,
    getDistance
} from './location.controller.js'
import { validateJWT }       from '../../../middlewares/validate_jwt.js'
import { requireRole }       from '../../../middlewares/validate_role.js'
import { locationValidator } from '../../../middlewares/locationValidator.js'

const router = Router()

// Obtiene todas las locations (público — necesario para registro y búsqueda)
router.get(
    '/',
    getLocations
)

// Densidad de servicios por zona
router.get(
    '/zone-density',
    validateJWT,
    getZoneDensity
)

// Distancia entre dos ubicaciones: ?from=<id>&to=<id>
router.get(
    '/distance',
    validateJWT,
    getDistance
)

// Centro geográfico de una zona
router.get(
    '/:id/geographic-center',
    validateJWT,
    getGeographicCenter
)

// Obtiene una location por id
router.get(
    '/:id',
    validateJWT,
    getLocation
)

// Crea una nueva location (solo admin)
router.post(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    locationValidator,
    createLocation
)

// Actualiza una location (solo admin)
router.put(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    locationValidator,
    updateLocation
)

// Soft delete (solo admin)
router.delete(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    deleteLocation
)

export default router