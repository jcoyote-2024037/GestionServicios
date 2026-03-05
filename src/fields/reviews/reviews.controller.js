'use strict'

import Review from './reviews.model.js'
import Service from '../services/services.model.js'

const updateServiceAverage = async (servicioId) => {
    const result = await Review.aggregate([
        { $match: { servicioId: new (await import('mongoose')).default.Types.ObjectId(servicioId) } },
        { $group: { _id: '$servicioId', promedio: { $avg: '$calificacion' } } }
    ])

    const promedio = result.length > 0 ? parseFloat(result[0].promedio.toFixed(2)) : 0

    await Service.findByIdAndUpdate(servicioId, { promedioCalificacion: promedio })
}

export const createReview = async (req, res) => {
    try {
        const { servicioId, usuarioId, calificacion, comentario } = req.body

        const service = await Service.findById(servicioId)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

        const review = new Review({ servicioId, usuarioId, calificacion, comentario })
        await review.save()

        await updateServiceAverage(servicioId)

        return res.status(201).json({
            success: true,
            message: 'Reseña creada correctamente',
            review
        })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una reseña de este usuario para este servicio'
            })
        }
        return res.status(500).json({
            success: false,
            message: 'Error al crear la reseña',
            error: error.message
        })
    }
}

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('servicioId', 'nombre ubicacion promedioCalificacion')
            .sort({ fecha: -1 })

        return res.status(200).json({
            success: true,
            total: reviews.length,
            reviews
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las reseñas',
            error: error.message
        })
    }
}

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params

        const review = await Review.findById(id)
            .populate('servicioId', 'nombre ubicacion promedioCalificacion')

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            })
        }

        return res.status(200).json({
            success: true,
            review
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la reseña',
            error: error.message
        })
    }
}

export const getReviewsByService = async (req, res) => {
    try {
        const { servicioId } = req.params
        const { calificacion } = req.query

        const filter = { servicioId }

        if (calificacion) {
            const cal = parseInt(calificacion)
            if (isNaN(cal) || cal < 1 || cal > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'La calificación debe ser un número entre 1 y 5'
                })
            }
            filter.calificacion = cal
        }

        const reviews = await Review.find(filter)
            .populate('servicioId', 'nombre ubicacion promedioCalificacion')
            .sort({ fecha: -1 })

        return res.status(200).json({
            success: true,
            total: reviews.length,
            reviews
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las reseñas del servicio',
            error: error.message
        })
    }
}

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params
        const { calificacion, comentario } = req.body

        const review = await Review.findByIdAndUpdate(
            id,
            { calificacion, comentario },
            { new: true, runValidators: true }
        )

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            })
        }

        await updateServiceAverage(review.servicioId)

        return res.status(200).json({
            success: true,
            message: 'Reseña actualizada correctamente',
            review
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la reseña',
            error: error.message
        })
    }
}

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params

        const review = await Review.findByIdAndDelete(id)

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            })
        }
        await updateServiceAverage(review.servicioId)

        return res.status(200).json({
            success: true,
            message: 'Reseña eliminada correctamente'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la reseña',
            error: error.message
        })
    }
}
