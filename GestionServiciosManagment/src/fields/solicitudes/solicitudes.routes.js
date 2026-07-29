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
    getHistorialPorServicio,
    expirarSolicitudes
} from './solicitudes.controller.js'
import { validateJWT }  from '../../../middlewares/validate_jwt.js'
import { requireRole }  from '../../../middlewares/validate_role.js'
import { solicitudesValidator, cambioEstadoValidator } from '../../../middlewares/solicitudesValidator.js'

const router = Router()
router.use(validateJWT)

/**
 * @swagger
 * /solicitudes/create:
 *   post:
 *     summary: Crear una solicitud de servicio
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitudInput'
 *     responses:
 *       201:
 *         description: Solicitud creada
 *       400:
 *         description: Datos inválidos
 */
router.post('/create', solicitudesValidator, createSolicitud)

/**
 * @swagger
 * /solicitudes:
 *   get:
 *     summary: Obtener todas las solicitudes (Admin)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *       403:
 *         description: Acceso denegado
 */
router.get('/', requireRole('ADMIN_ROLE', 'DUENO_ROLE'), getSolicitudes)

/**
 * @swagger
 * /solicitudes/update/{id}:
 *   put:
 *     summary: Actualizar una solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitudInput'
 *     responses:
 *       200:
 *         description: Solicitud actualizada
 */
router.put('/update/:id', requireRole('ADMIN_ROLE', 'DUENO_ROLE'), solicitudesValidator, updateSolicitud)

/**
 * @swagger
 * /solicitudes/delete/{id}:
 *   delete:
 *     summary: Eliminar una solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitud eliminada
 */
router.delete('/delete/:id', requireRole('ADMIN_ROLE', 'DUENO_ROLE'), deleteSolicitud)

/**
 * @swagger
 * /solicitudes/estado/{id}:
 *   patch:
 *     summary: Cambiar el estado de una solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambioEstadoInput'
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/estado/:id', cambioEstadoValidator, cambiarEstado)

/**
 * @swagger
 * /solicitudes/historial/usuario/{usuarioId}:
 *   get:
 *     summary: Historial de solicitudes de un usuario
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial del usuario
 */
router.get('/historial/usuario/:usuarioId', getHistorialPorUsuario)

/**
 * @swagger
 * /solicitudes/historial/servicio/{servicioId}:
 *   get:
 *     summary: Historial de solicitudes de un servicio
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: servicioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial del servicio
 */
router.get('/historial/servicio/:servicioId', getHistorialPorServicio)

/**
 * @swagger
 * /solicitudes/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', getSolicitudById)

// Expiración automática (admin / cron)
router.post('/expirar', requireRole('ADMIN_ROLE'), expirarSolicitudes)

export default router
