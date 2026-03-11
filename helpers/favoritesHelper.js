'use strict'

import Favorite from '../src/fields/favorites/favorites.model.js'
import Service from '../src/fields/services/services.model.js'

const MAX_FAVORITOS_POR_USUARIO  = 200
const DIAS_ABANDONO              = 90
const ABANDONO_MS                = DIAS_ABANDONO * 24 * 60 * 60 * 1000
const POPULARIDAD_VENTANA_DIAS   = 30

// ─────────────────────────────────────────────────────────────────────────────
// VALIDACIONES
// ─────────────────────────────────────────────────────────────────────────────

/** Verifica si el usuario ya alcanzó el límite de 200 favoritos */
export const verificarLimiteFavoritos = async (usuarioId) => {
    const count = await Favorite.countDocuments({ usuarioId })
    return count >= MAX_FAVORITOS_POR_USUARIO
}

/** Verifica si el servicio está activo */
export const servicioEstaActivo = async (servicioId) => {
    const service = await Service.findById(servicioId).select('estado')
    return service ? service.estado === 'activo' : false
}

// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA ADICIONAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detecta y marca favoritos sin interacción en los últimos 90 días.
 * Ideal para ejecutar como cron job.
 */
export const detectarFavoritosAbandonados = async () => {
    const limite = new Date(Date.now() - ABANDONO_MS)
    const resultado = await Favorite.updateMany(
        { lastInteractionAt: { $lt: limite }, abandonado: false },
        { $set: { abandonado: true } }
    )
    return resultado.modifiedCount
}

/** Actualiza la fecha de última interacción y desmarca como abandonado */
export const registrarInteraccion = async (favoriteId) => {
    await Favorite.findByIdAndUpdate(favoriteId, {
        lastInteractionAt: new Date(),
        abandonado: false
    })
}

/**
 * Genera recomendaciones basadas en categorías de los favoritos del usuario.
 * Ordena por popularidad y calificación.
 */
export const generarRecomendaciones = async (usuarioId, limite = 10) => {
    const userFavorites = await Favorite.find({ usuarioId }).select('servicioId')
    const favServiceIds = userFavorites.map(f => f.servicioId)

    if (favServiceIds.length === 0) return []

    const favServices = await Service.find({ _id: { $in: favServiceIds } }).select('categoriaId')
    const categoryIds = [...new Set(
        favServices.map(s => s.categoriaId?.toString()).filter(Boolean)
    )]

    const sugerencias = await Service.find({
        categoriaId: { $in: categoryIds },
        _id: { $nin: favServiceIds },
        estado: 'activo'
    })
        .sort({ favoritosCount: -1, promedioCalificacion: -1 })
        .limit(limite)
        .select('nombre descripcion promedioCalificacion categoriaId locationId favoritosCount')

    return sugerencias
}

/**
 * Calcula la popularidad reciente de un servicio.
 * Retorna totalFavoritos, favoritosRecientes (últimos 30 días) y puntuaciónPopularidad.
 */
export const calcularPopularidad = async (servicioId) => {
    const desde = new Date(Date.now() - POPULARIDAD_VENTANA_DIAS * 24 * 60 * 60 * 1000)

    const [totalFavoritos, favoritosRecientes] = await Promise.all([
        Favorite.countDocuments({ servicioId }),
        Favorite.countDocuments({ servicioId, createdAt: { $gte: desde } })
    ])

    const puntuacionPopularidad = totalFavoritos + (favoritosRecientes * 2)

    return { totalFavoritos, favoritosRecientes, puntuacionPopularidad }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/** Cuenta los favoritos de un servicio y actualiza favoritosCount en Service */
export const syncFavoritesCount = async (servicioId) => {
    const count = await Favorite.countDocuments({ servicioId })
    await Service.findByIdAndUpdate(servicioId, {
        favoritosCount: count,
        lastActivityAt: new Date()
    })
}