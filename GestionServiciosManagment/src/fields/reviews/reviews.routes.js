'use strict'

import { Router } from "express"
import {
    createReview, getReviews, getReviewById,
    getReviewsByService, updateReview, deleteReview,
    moderateReview, likeReview, reportReview
} from "./reviews.controller.js"
import {
    reviewsValidator,
    reviewsUpdateValidator,
    reportReviewValidator
} from "../../../middlewares/reviewsValidator.js"
import { validateJWT } from "../../../middlewares/validate_jwt.js"

const router = Router()

/**
 * @swagger
 * /reviews/create:
 *   post:
 *     summary: Crear una reseña
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Reseña creada correctamente
 *       400:
 *         description: Datos inválidos (links, comentario repetido, etc.)
 *       403:
 *         description: Sin solicitud previa, servicio suspendido o reseña propia
 *       409:
 *         description: Ya existe una reseña de este usuario para este servicio
 *       429:
 *         description: Límite de spam alcanzado (3 reseñas en 10 minutos)
 */
router.post('/create', validateJWT, reviewsValidator, createReview)

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Obtener todas las reseñas
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [visible, all]
 *         description: Filtrar por estado. Sin parámetro devuelve solo visibles.
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get('/', getReviews)

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Obtener reseña por ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña encontrada
 *       404:
 *         description: Reseña no encontrada
 */
router.get('/:id', getReviewById)

/**
 * @swagger
 * /reviews/service/{servicioId}:
 *   get:
 *     summary: Obtener reseñas por servicio
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: servicioId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: calificacion
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filtrar por calificación exacta
 *     responses:
 *       200:
 *         description: Lista de reseñas del servicio
 */
router.get('/service/:servicioId', getReviewsByService)

/**
 * @swagger
 * /reviews/update/{id}:
 *   put:
 *     summary: Actualizar una reseña (máx. 24 horas después de crearla)
 *     tags: [Reviews]
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
 *             $ref: '#/components/schemas/ReviewUpdateInput'
 *     responses:
 *       200:
 *         description: Reseña actualizada
 *       403:
 *         description: Plazo de edición vencido o servicio suspendido
 *       404:
 *         description: Reseña no encontrada
 */
router.put('/update/:id', validateJWT, reviewsUpdateValidator, updateReview)

/**
 * @swagger
 * /reviews/delete/{id}:
 *   delete:
 *     summary: Eliminar una reseña
 *     tags: [Reviews]
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
 *         description: Reseña eliminada
 *       404:
 *         description: Reseña no encontrada
 */
router.delete('/delete/:id', validateJWT, deleteReview)

/**
 * @swagger
 * /reviews/like/{id}:
 *   patch:
 *     summary: Dar like a una reseña
 *     tags: [Reviews]
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
 *         description: Like registrado
 *       404:
 *         description: Reseña no encontrada
 */
router.patch('/like/:id', validateJWT, likeReview)

/**
 * @swagger
 * /reviews/moderate/{id}:
 *   patch:
 *     summary: Moderar una reseña (Admin)
 *     tags: [Reviews]
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
 *             $ref: '#/components/schemas/ReviewModerateInput'
 *     responses:
 *       200:
 *         description: Estado de la reseña actualizado
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Reseña no encontrada
 */
router.patch('/moderate/:id', validateJWT, moderateReview)

/**
 * @swagger
 * /reviews/report/{id}:
 *   post:
 *     summary: Reportar una reseña (se oculta automáticamente al superar 5 reportes)
 *     tags: [Reviews]
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
 *             $ref: '#/components/schemas/ReviewReportInput'
 *     responses:
 *       200:
 *         description: Reseña reportada (o auto-ocultada si superó el umbral)
 *       404:
 *         description: Reseña no encontrada
 *       409:
 *         description: Ya reportaste esta reseña anteriormente
 */
router.post('/report/:id', validateJWT, reportReviewValidator, reportReview)

export default router