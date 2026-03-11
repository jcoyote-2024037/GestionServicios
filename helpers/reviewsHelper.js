'use strict'

import mongoose from 'mongoose'
import Review from '../src/fields/reviews/reviews.model.js'
import Service from '../src/fields/services/services.model.js'
import Solicitud from '../src/fields/solicitudes/solicitudes.model.js'

// ── Palabras ofensivas para moderación automática ──────────────────────────
const PALABRAS_OFENSIVAS = [
    'spam', 'estafa', 'fraude', 'scam', 'fake', 'mentira',
    'idiota', 'imbecil', 'estupido', 'mierda', 'basura',
    'asco', 'inutil', 'estafador', 'ladrón'
]

// ── Palabras positivas / negativas para sentimiento básico ─────────────────
const PALABRAS_POSITIVAS = [
    'excelente', 'bueno', 'genial', 'perfecto', 'increíble', 'maravilloso',
    'recomiendo', 'satisfecho', 'feliz', 'contento', 'rápido', 'puntual',
    'profesional', 'amable', 'calidad', 'útil', 'encantó', 'fantástico'
]
const PALABRAS_NEGATIVAS = [
    'malo', 'pésimo', 'terrible', 'horrible', 'decepcionante', 'lento',
    'tarde', 'robo', 'caro', 'deficiente', 'ineficiente', 'no funciona',
    'no recomiendo', 'arrepentido', 'estafa', 'fraude', 'perdida', 'molesto'
]

// ── Regex para detectar links externos ────────────────────────────────────
const REGEX_LINKS = /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9.-]+\.(com|net|org|io|co|mx|info|biz)\b/gi

// ── Límites de spam: 3 reseñas en 10 minutos ──────────────────────────────
const SPAM_LIMITE             = 3
const SPAM_VENTANA_MS         = 10 * 60 * 1000  // 10 minutos
const REPORTE_UMBRAL_OCULTAR  = 5               // reportes para ocultar automáticamente
const FALSA_VENTANA_MS        = 60 * 60 * 1000  // 1 hora para detectar falsas
const FALSA_UMBRAL            = 10              // misma calificación de N usuarios distintos en 1 h

export const EDICION_LIMITE_MS = 24 * 60 * 60 * 1000  // 24 horas

// ─────────────────────────────────────────────────────────────────────────────
// VALIDACIONES
// ─────────────────────────────────────────────────────────────────────────────

/** Verifica que el usuario haya solicitado el servicio al menos una vez */
export const verificarSolicitudPrevia = async (usuarioId, servicioId) => {
    const solicitud = await Solicitud.findOne({ usuarioId, servicioId })
    return solicitud !== null
}

/** Devuelve true si el comentario contiene links externos */
export const contieneLinks = (texto) => {
    REGEX_LINKS.lastIndex = 0
    return REGEX_LINKS.test(texto)
}

/** Devuelve true si el comentario parece repetido respecto a reseñas recientes del usuario */
export const esComentarioInvalido = async (usuarioId, comentario) => {
    const limpio = comentario.trim().toLowerCase()
    const recientes = await Review.find({ usuarioId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('comentario')
    const repetida = recientes.some(r => r.comentario.trim().toLowerCase() === limpio)
    return repetida
}

/** Devuelve true si el servicio está suspendido/inactivo */
export const servicioSuspendido = async (servicioId) => {
    const service = await Service.findById(servicioId).select('estado')
    return service ? service.estado !== 'activo' : false
}

/** Devuelve true si el usuario superó 3 reseñas en los últimos 10 minutos */
export const detectarSpam = async (usuarioId) => {
    const desde = new Date(Date.now() - SPAM_VENTANA_MS)
    const count = await Review.countDocuments({
        usuarioId,
        createdAt: { $gte: desde }
    })
    return count >= SPAM_LIMITE
}

// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA ADICIONAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el sentimiento básico del comentario.
 * Retorna { score: -1|0|1, label: 'negativo'|'neutro'|'positivo' }
 */
export const calcularSentimiento = (texto) => {
    const lower = texto.toLowerCase()
    let positivos = 0
    let negativos = 0

    PALABRAS_POSITIVAS.forEach(p => { if (lower.includes(p)) positivos++ })
    PALABRAS_NEGATIVAS.forEach(p => { if (lower.includes(p)) negativos++ })

    if (positivos > negativos) return { score: 1, label: 'positivo' }
    if (negativos > positivos) return { score: -1, label: 'negativo' }
    return { score: 0, label: 'neutro' }
}

/** Retorna 'flagged' si el texto contiene palabras ofensivas, 'visible' en caso contrario */
export const calcularStatus = (texto) => {
    const textoLower = texto.toLowerCase()
    const encontrada = PALABRAS_OFENSIVAS.some(p => textoLower.includes(p))
    return encontrada ? 'flagged' : 'visible'
}

/**
 * Detecta posibles reseñas falsas: si en la última hora N usuarios distintos
 * calificaron con la misma puntuación al mismo servicio, se marca como posible falsa.
 */
export const detectarReseniaFalsa = async (servicioId, calificacion) => {
    const desde = new Date(Date.now() - FALSA_VENTANA_MS)
    const count = await Review.countDocuments({
        servicioId,
        calificacion,
        createdAt: { $gte: desde }
    })
    return count >= FALSA_UMBRAL
}

/**
 * Procesa un reporte sobre una reseña.
 * Incrementa el contador, registra quién reportó, y oculta automáticamente
 * si supera el umbral de reportes.
 * Retorna { updated: Review, autoOculta: boolean, duplicado: boolean }
 */
export const procesarReporte = async (reviewId, usuarioReportaId) => {
    const review = await Review.findById(reviewId)
    if (!review) return null

    // Evitar reportes duplicados del mismo usuario
    if (review.reportadoPor.includes(usuarioReportaId))
        return { updated: review, autoOculta: false, duplicado: true }

    review.reportadoPor.push(usuarioReportaId)
    review.reportesCount = review.reportadoPor.length

    const autoOculta = review.reportesCount >= REPORTE_UMBRAL_OCULTAR
    if (autoOculta) review.status = 'hidden'

    await review.save()
    return { updated: review, autoOculta, duplicado: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/** Recalcula y guarda el promedio de calificación del servicio (solo reseñas visibles) */
export const updateServiceAverage = async (servicioId) => {
    const result = await Review.aggregate([
        {
            $match: {
                servicioId: new mongoose.Types.ObjectId(servicioId),
                status: 'visible'
            }
        },
        {
            $group: {
                _id: '$servicioId',
                promedio: { $avg: '$calificacion' },
                totalReviews: { $sum: 1 }
            }
        }
    ])

    const promedio = result.length > 0 ? parseFloat(result[0].promedio.toFixed(2)) : 0
    const reviewsCount = result.length > 0 ? result[0].totalReviews : 0

    await Service.findByIdAndUpdate(servicioId, {
        promedioCalificacion: promedio,
        averageRating: promedio,
        reviewsCount,
        lastActivityAt: new Date()
    })
}