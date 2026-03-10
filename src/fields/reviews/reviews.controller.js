'use strict'

import Review from './reviews.model.js'
import Service from '../services/services.model.js'
import {
    updateServiceAverage,
    detectarSpam,
    calcularStatus,
    EDICION_LIMITE_MS
} from '../../../helpers/reviewsHelper.js'

export const createReview = async (req, res) => {
    try {
        const { servicioId, usuarioId, calificacion, comentario, title, isVerifiedPurchase } = req.body

        const service = await Service.findById(servicioId)
        if (!service)
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

        // Usuario no puede reseñar su propio servicio
        if (service.usuarioId === usuarioId)
            return res.status(403).json({ success: false, message: 'No puedes reseñar tu propio servicio' })

        // Detección de spam
        if (await detectarSpam(usuarioId))
            return res.status(429).json({
                success: false,
                message: 'Has enviado demasiadas reseñas en poco tiempo. Intenta de nuevo más tarde.'
            })

        // Moderación automática
        const status = calcularStatus(`${title || ''} ${comentario}`)

        const review = new Review({
            servicioId, usuarioId, calificacion, comentario,
            title: title || null,
            isVerifiedPurchase: isVerifiedPurchase || false,
            status
        })

        await review.save()
        await updateServiceAverage(servicioId)

        return res.status(201).json({
            success: true,
            message: status === 'flagged' ? 'Reseña creada, pendiente de moderación' : 'Reseña creada correctamente',
            review
        })

    } catch (error) {
        if (error.code === 11000)
            return res.status(409).json({ success: false, message: 'Ya existe una reseña de este usuario para este servicio' })
        return res.status(500).json({ success: false, message: 'Error al crear la reseña', error: error.message })
    }
}

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

export const updateReview = async (req, res) => {
    try {
        const { calificacion, comentario, title } = req.body

        const review = await Review.findById(req.params.id)
        if (!review)
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' })

        // Validar ventana de edición de 24 h
        if (Date.now() - review.createdAt.getTime() > EDICION_LIMITE_MS)
            return res.status(403).json({ success: false, message: 'El plazo para editar esta reseña ha vencido (24 horas)' })

        if (calificacion !== undefined) review.calificacion = calificacion
        if (comentario !== undefined) review.comentario = comentario
        if (title !== undefined) review.title = title

        // Re-moderar si cambia el contenido
        if (comentario !== undefined || title !== undefined)
            review.status = calcularStatus(`${review.title || ''} ${review.comentario}`)

        review.isEdited = true
        review.editedAt = new Date()

        await review.save()
        await updateServiceAverage(review.servicioId)

        return res.status(200).json({ success: true, message: 'Reseña actualizada correctamente', review })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al actualizar la reseña', error: error.message })
    }
}

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