'use strict'

import { Router } from 'express'
import {
    createSolicitud,
    getSolicitudes,
    getSolicitudById,
    updateSolicitud,
    deleteSolicitud,
    cambiarEstado,
    getHistorialPorUsuario,
    getHistorialPorServicio
} from './solicitudes.controller.js'

import { validateJWT }  from '../../../middlewares/validate_jwt.js'
import { requireRole }  from '../../../middlewares/validate_role.js'
import { solicitudesValidator, cambioEstadoValidator } from '../../../middlewares/servicesValidator.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(validateJWT)

// CRUD base
router.post('/create',           solicitudesValidator, createSolicitud)
router.get('/',                  requireRole('ADMIN_ROLE'), getSolicitudes)
router.get('/:id',               getSolicitudById)
router.put('/update/:id',        solicitudesValidator, updateSolicitud)
router.delete('/delete/:id',     deleteSolicitud)

// Cambio de estado controlado
router.patch('/estado/:id',      cambioEstadoValidator, cambiarEstado)

// Historiales
router.get('/historial/usuario/:usuarioId',    getHistorialPorUsuario)
router.get('/historial/servicio/:servicioId',  getHistorialPorServicio)

export default router
