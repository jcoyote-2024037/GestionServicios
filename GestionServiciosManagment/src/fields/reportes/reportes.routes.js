'use strict'

import { Router } from 'express'
import {
    createReporte,
    getReportes,
    getReporteById,
    updateReporte,
    deleteReporte,
    getReportesPendientes,
    marcarComoRevisado
} from './reportes.controller.js'

import { validateJWT } from '../../../middlewares/validate_jwt.js'
import { requireRole } from '../../../middlewares/validate_role.js'
import { reportesValidator, revisarReporteValidator } from '../../../middlewares/reportesValidator.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(validateJWT)

// Cualquier usuario autenticado puede crear un reporte
router.post('/create', reportesValidator, createReporte)

// Solo admins pueden ver todos los reportes, actualizar o eliminar
router.get('/',                           requireRole('ADMIN_ROLE'), getReportes)
router.get('/pendientes',                 requireRole('ADMIN_ROLE'), getReportesPendientes)
router.get('/:id',                        requireRole('ADMIN_ROLE'), getReporteById)
router.put('/update/:id',                 requireRole('ADMIN_ROLE'), updateReporte)
router.delete('/delete/:id',              requireRole('ADMIN_ROLE'), deleteReporte)

// Revisar reporte (admin) — resuelve o desestima + desactiva servicio si resolved
router.patch('/revisar/:id',              requireRole('ADMIN_ROLE'), revisarReporteValidator, marcarComoRevisado)

export default router
