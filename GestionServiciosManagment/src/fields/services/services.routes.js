'use strict'

import { Router } from "express"
import {
    createService, getServices, getServiceById,
    updateService, deleteService, getMyServices, getNearbyServices,
    getFeaturedServices, getPopularServices
} from "./services.controller.js"
import { servicesValidator } from "../../../middlewares/servicesValidator.js"
import { validateJWT } from "../../../middlewares/validate_jwt.js"
import { requireRole } from '../../../middlewares/validate_role.js';
import { uploadImages } from '../../../middlewares/upload.js';

const router = Router()

/**
 * @swagger
 * /services/create:
 *   post:
 *     summary: Crear un servicio
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201:
 *         description: Servicio creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/create', validateJWT, requireRole('ADMIN_ROLE', 'DUENO_ROLE'), uploadImages, servicesValidator, createService)

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Obtener todos los servicios
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Lista de servicios
 */
router.get('/', getServices)

/**
 * @swagger
 * /services/mine:
 *   get:
 *     summary: Obtener servicios del usuario autenticado (Dueño)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios del usuario
 */
router.get('/mine', validateJWT, getMyServices)

router.get('/nearby', validateJWT, getNearbyServices)

/**
 * @swagger
 * /services/featured:
 *   get:
 *     summary: Obtener servicios destacados
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Lista de servicios destacados
 */
router.get('/featured', getFeaturedServices)

/**
 * @swagger
 * /services/popular:
 *   get:
 *     summary: Obtener servicios populares
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Lista de servicios populares
 */
router.get('/popular', getPopularServices)

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Obtener servicio por ID
 *     tags: [Services]
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
 *         description: Servicio encontrado
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', validateJWT, getServiceById)

/**
 * @swagger
 * /services/update/{id}:
 *   put:
 *     summary: Actualizar un servicio (Admin)
 *     tags: [Services]
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
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/update/:id', validateJWT, requireRole('ADMIN_ROLE', 'DUENO_ROLE'), uploadImages, servicesValidator, updateService)

/**
 * @swagger
 * /services/delete/{id}:
 *   delete:
 *     summary: Eliminar un servicio
 *     tags: [Services]
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
 *         description: Servicio eliminado
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/delete/:id', validateJWT, requireRole('ADMIN_ROLE', 'DUENO_ROLE'), deleteService)
export default router