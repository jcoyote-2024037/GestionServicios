'use strict'

import mongoose from 'mongoose'
import Review from '../src/fields/reviews/reviews.model.js'
import Service from '../src/fields/services/services.model.js'

// ── Palabras prohibidas para moderación automática ─────────────────────────
const PALABRAS_PROHIBIDAS = [
    'spam', 'estafa', 'fraude', 'scam', 'fake', 'mentira',
    'idiota', 'imbecil', 'estupido', 'mierda', 'basura'
]

const SPAM_LIMITE = 5
const SPAM_VENTANA_MS = 60 * 60 * 1000   // 1 hora

export const EDICION_LIMITE_MS = 24 * 60 * 60 * 1000  // 24 horas

/** Recalcula y guarda el promedio de calificación del servicio (solo reseñas visibles) */
export const updateServiceAverage = async (servicioId) => {
    const result = await Review.aggregate([
        {
            $match: {
                servicioId: new mongoose.Types.ObjectId(servicioId),
                status: 'visible'
            }
        },
        { $group: { _id: '$servicioId', promedio: { $avg: '$calificacion' } } }
    ])

    const promedio = result.length > 0
        ? parseFloat(result[0].promedio.toFixed(2))
        : 0

    await Service.findByIdAndUpdate(servicioId, { promedioCalificacion: promedio })
}

/** Devuelve true si el usuario superó el límite de reseñas en la última hora */
export const detectarSpam = async (usuarioId) => {
    const desde = new Date(Date.now() - SPAM_VENTANA_MS)
    const count = await Review.countDocuments({
        usuarioId,
        createdAt: { $gte: desde }
    })
    return count >= SPAM_LIMITE
}

/** Retorna 'flagged' si el texto contiene palabras prohibidas, 'visible' en caso contrario */
export const calcularStatus = (texto) => {
    const textoLower = texto.toLowerCase()
    const encontrada = PALABRAS_PROHIBIDAS.some(p => textoLower.includes(p))
    return encontrada ? 'flagged' : 'visible'
}