'use strict'

import Review from './reviews.model.js'
import Service from '../services/services.model.js'
import {
    updateServiceAverage,
    detectarSpam,
    calcularStatus,
    calcularSentimiento,
    verificarSolicitudPrevia,
    contieneLinks,
    esComentarioInvalido,
    servicioSuspendido,
    detectarReseniaFalsa,
    procesarReporte,
    EDICION_LIMITE_MS
} from '../../../helpers/reviewsHelper.js'

// ─────────────────────────────────────────────────────────────────────────────
// CREAR RESEÑA
// ─────────────────────────────────────────────────────────────────────────────

export const createReview = async (req, res) => {
    try {
        const { servicioId, usuarioId, calificacion, comentario, title, isVerifiedPurchase } = req.body

        const service = await Service.findById(servicioId)
        if (!service)
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

        // Usuario no puede reseñar su propio servicio
        if (service.usuarioId === usuarioId)
            return res.status(403).json({ success: false, message: 'No puedes reseñar tu propio servicio' })

        // No permitir reseñas en servicios suspendidos
        if (await servicioSuspendido(servicioId))
            return res.status(403).json({ success: false, message: 'No puedes reseñar un servicio suspendido o inactivo' })

        // Validar que el usuario haya solicitado el servicio previamente
        const tieneSolicitud = await verificarSolicitudPrevia(usuarioId, servicioId)
        if (!tieneSolicitud)
            return res.status(403).json({
                success: false,
                message: 'Solo puedes reseñar servicios que hayas solicitado anteriormente'
            })

        // Validar que el comentario no contenga links externos
        if (contieneLinks(`${title || ''} ${comentario}`))
            return res.status(400).json({ success: false, message: 'La reseña no puede contener enlaces externos' })

        // Detectar comentario repetido
        if (await esComentarioInvalido(usuarioId, comentario))
            return res.status(400).json({ success: false, message: 'Ya enviaste una reseña con contenido muy similar recientemente' })

        // Límite de spam: 3 reseñas en 10 minutos
        if (await detectarSpam(usuarioId))
            return res.status(429).json({
                success: false,
                message: 'Has enviado demasiadas reseñas en poco tiempo. Espera unos minutos antes de continuar.'
            })

        // Moderación automática por lenguaje ofensivo
        const status = calcularStatus(`${title || ''} ${comentario}`)

        // Calcular sentimiento básico del comentario
        const sentimiento = calcularSentimiento(`${title || ''} ${comentario}`)

        // Detectar posible reseña falsa
        const posibleFalsa = await detectarReseniaFalsa(servicioId, calificacion)

        const review = new Review({
            servicioId, usuarioId, calificacion, comentario,
            title: title || null,
            isVerifiedPurchase: isVerifiedPurchase || false,
            status,
            sentimentScore: sentimiento.score,
            sentimentLabel: sentimiento.label,
            posibleFalsa
        })

        await review.save()
        await updateServiceAverage(servicioId)

        let message = 'Reseña creada correctamente'
        if (status === 'flagged') message = 'Reseña creada, pendiente de moderación por lenguaje inapropiado'
        if (posibleFalsa) message = 'Reseña creada, pendiente de verificación'

        return res.status(201).json({ success: true, message, review })

    } catch (error) {
        if (error.code === 11000)
            return res.status(409).json({ success: false, message: 'Ya existe una reseña de este usuario para este servicio' })
        return res.status(500).json({ success: false, message: 'Error al crear la reseña', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTAS
// ─────────────────────────────────────────────────────────────────────────────

export const getReviews = async (req, res) => {
    try {
        const { status } = req.query
        const filter = status === 'all' ? {} : { status: 'visible' }

        const reviews = await Review.find(filter)
            .populate('servicioId', 'nombre ubicacion promedioCalificacion')
            .sort({ fecha: -1 })

        return res.status(200).json({ success: true, total: reviews.length, reviews })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener las reseñas', error: error.message })
    }
}

export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('servicioId', 'nombre ubicacion promedioCalificacion')

        if (!review)
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' })

        return res.status(200).json({ success: true, review })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener la reseña', error: error.message })
    }
}

export const getReviewsByService = async (req, res) => {
    try {
        const { servicioId } = req.params
        const { calificacion } = req.query

        const filter = { servicioId, status: 'visible' }

        if (calificacion) {
            const cal = parseInt(calificacion)
            if (isNaN(cal) || cal < 1 || cal > 5)
                return res.status(400).json({ success: false, message: 'La calificación debe ser un número entre 1 y 5' })
            filter.calificacion = cal
        }

        const reviews = await Review.find(filter)
            .populate('servicioId', 'nombre ubicacion promedioCalificacion')
            .sort({ fecha: -1 })

        return res.status(200).json({ success: true, total: reviews.length, reviews })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener las reseñas del servicio', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR RESEÑA
// ─────────────────────────────────────────────────────────────────────────────

export const updateReview = async (req, res) => {
    try {
        const { calificacion, comentario, title } = req.body

        const review = await Review.findById(req.params.id)
        if (!review)
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' })

        if (Date.now() - review.createdAt.getTime() > EDICION_LIMITE_MS)
            return res.status(403).json({ success: false, message: 'El plazo para editar esta reseña ha vencido (24 horas)' })

        if (await servicioSuspendido(review.servicioId))
            return res.status(403).json({ success: false, message: 'No se puede editar una reseña de un servicio suspendido' })

        if (calificacion !== undefined) review.calificacion = calificacion
        if (comentario !== undefined) {
            if (contieneLinks(`${title ?? review.title ?? ''} ${comentario}`))
                return res.status(400).json({ success: false, message: 'La reseña no puede contener enlaces externos' })
            review.comentario = comentario
        }
        if (title !== undefined) review.title = title

        if (comentario !== undefined || title !== undefined) {
            const texto = `${review.title || ''} ${review.comentario}`
            review.status = calcularStatus(texto)
            const sentimiento = calcularSentimiento(texto)
            review.sentimentScore = sentimiento.score
            review.sentimentLabel = sentimiento.label
        }

        review.isEdited = true
        review.editedAt = new Date()

        await review.save()
        await updateServiceAverage(review.servicioId)

        return res.status(200).json({ success: true, message: 'Reseña actualizada correctamente', review })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al actualizar la reseña', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR
// ─────────────────────────────────────────────────────────────────────────────

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id)
        if (!review)
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' })

        await updateServiceAverage(review.servicioId)

        return res.status(200).json({ success: true, message: 'Reseña eliminada correctamente' })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al eliminar la reseña', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODERACIÓN
// ─────────────────────────────────────────────────────────────────────────────

export const moderateReview = async (req, res) => {
    try {
        const { status } = req.body
        const allowed = ['visible', 'hidden', 'flagged']

        if (!allowed.includes(status))
            return res.status(400).json({ success: false, message: `Status inválido. Valores permitidos: ${allowed.join(', ')}` })

        const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true })
        if (!review)
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' })

        await updateServiceAverage(review.servicioId)

        return res.status(200).json({ success: true, message: `Reseña marcada como "${status}"`, review })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al moderar la reseña', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIKE
// ─────────────────────────────────────────────────────────────────────────────

export const likeReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { likesCount: 1 } },
            { new: true }
        )
        if (!review)
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' })

        return res.status(200).json({ success: true, message: 'Like registrado', likesCount: review.likesCount })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al registrar like', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTAR RESEÑA
// ─────────────────────────────────────────────────────────────────────────────

export const reportReview = async (req, res) => {
    try {
        const { usuarioId } = req.body
        const { id } = req.params

        if (!usuarioId || typeof usuarioId !== 'number')
            return res.status(400).json({ success: false, message: 'El usuarioId es obligatorio y debe ser un número entero' })

        const resultado = await procesarReporte(id, usuarioId)
        if (!resultado)
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' })

        if (resultado.duplicado)
            return res.status(409).json({ success: false, message: 'Ya reportaste esta reseña anteriormente' })

        return res.status(200).json({
            success: true,
            message: resultado.autoOculta
                ? 'Reseña reportada y ocultada automáticamente por exceso de reportes'
                : 'Reseña reportada correctamente',
            reportesCount: resultado.updated.reportesCount,
            status: resultado.updated.status
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al reportar la reseña', error: error.message })
    }
}