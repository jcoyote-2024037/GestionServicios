'use strict'

import { Router } from "express"
import {
    createFavorite, getFavorites, getFavoriteById,
    getFavoritesByUser, countFavoritesByService,
    deleteFavorite, updateFavorite, getSuggestions,
    getServicePopularity, trackInteraction, runAbandonedCheck
} from "./favorites.controller.js"
import { favoritesValidator, favoritesUpdateValidator } from "../../../middlewares/favoritesValidator.js"
import { validateJWT } from "../../../middlewares/validate_jwt.js"

const router = Router()

/**
 * @swagger
 * /favorites/create:
 *   post:
 *     summary: Agregar un servicio a favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteInput'
 *     responses:
 *       201:
 *         description: Servicio agregado a favoritos
 *       403:
 *         description: Servicio suspendido o límite de 200 favoritos alcanzado
 *       409:
 *         description: El servicio ya está en favoritos
 */
router.post('/create', validateJWT, favoritesValidator, createFavorite)

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Obtener todos los favoritos
 *     tags: [Favorites]
 *     responses:
 *       200:
 *         description: Lista de favoritos
 */
router.get('/', getFavorites)

/**
 * @swagger
 * /favorites/{id}:
 *   get:
 *     summary: Obtener favorito por ID
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorito encontrado
 *       404:
 *         description: Favorito no encontrado
 */
router.get('/:id', getFavoriteById)

/**
 * @swagger
 * /favorites/user/{usuarioId}:
 *   get:
 *     summary: Obtener favoritos de un usuario
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: soloAbandonados
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Mostrar solo favoritos sin interacción en 90+ días
 *       - in: query
 *         name: soloActivos
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Mostrar solo favoritos activos (no abandonados)
 *     responses:
 *       200:
 *         description: Lista de favoritos del usuario
 */
router.get('/user/:usuarioId', validateJWT, getFavoritesByUser)

/**
 * @swagger
 * /favorites/count/{servicioId}:
 *   get:
 *     summary: Contar cuántos usuarios guardaron un servicio como favorito
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: servicioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conteo de favoritos
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/count/:servicioId', countFavoritesByService)

/**
 * @swagger
 * /favorites/update/{id}:
 *   put:
 *     summary: Actualizar notas o notificaciones de un favorito
 *     tags: [Favorites]
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
 *             $ref: '#/components/schemas/FavoriteUpdateInput'
 *     responses:
 *       200:
 *         description: Favorito actualizado
 *       404:
 *         description: Favorito no encontrado
 */
router.put('/update/:id', validateJWT, favoritesUpdateValidator, updateFavorite)

/**
 * @swagger
 * /favorites/delete/{id}:
 *   delete:
 *     summary: Eliminar un favorito
 *     tags: [Favorites]
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
 *         description: Favorito eliminado
 *       404:
 *         description: Favorito no encontrado
 */
router.delete('/delete/:id', validateJWT, deleteFavorite)

/**
 * @swagger
 * /favorites/suggestions/{usuarioId}:
 *   get:
 *     summary: Obtener sugerencias de servicios basadas en favoritos del usuario
 *     tags: [Favorites]
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
 *         description: Lista de servicios sugeridos
 */
router.get('/suggestions/:usuarioId', validateJWT, getSuggestions)

/**
 * @swagger
 * /favorites/popularity/{servicioId}:
 *   get:
 *     summary: Calcular popularidad de un servicio según favoritos recientes
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: servicioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de popularidad (total, recientes, puntuación)
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/popularity/:servicioId', getServicePopularity)

/**
 * @swagger
 * /favorites/interact/{id}:
 *   patch:
 *     summary: Registrar interacción con un favorito (resetea contador de abandono)
 *     tags: [Favorites]
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
 *         description: Interacción registrada
 *       404:
 *         description: Favorito no encontrado
 */
router.patch('/interact/:id', validateJWT, trackInteraction)

/**
 * @swagger
 * /favorites/admin/check-abandoned:
 *   post:
 *     summary: Ejecutar revisión de favoritos abandonados (Admin)
 *     description: Marca como abandonados todos los favoritos sin interacción en los últimos 90 días.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revisión completada con cantidad de favoritos marcados
 */
router.post('/admin/check-abandoned', validateJWT, runAbandonedCheck)

export default router