'use strict'

import Favorite from './favorites.model.js'
import Service from '../services/services.model.js'
import {
    syncFavoritesCount,
    verificarLimiteFavoritos,
    servicioEstaActivo,
    generarRecomendaciones,
    calcularPopularidad,
    detectarFavoritosAbandonados,
    registrarInteraccion
} from '../../../helpers/favoritesHelper.js'

// ─────────────────────────────────────────────────────────────────────────────
// CREAR FAVORITO
// ─────────────────────────────────────────────────────────────────────────────

export const createFavorite = async (req, res) => {
    try {
        const { servicioId, notes, notificationEnabled } = req.body
        const usuarioId = req.user.id

        const service = await Service.findById(servicioId)
        if (!service)
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

        // No permitir agregar servicios suspendidos
        if (!(await servicioEstaActivo(servicioId)))
            return res.status(403).json({ success: false, message: 'No puedes agregar un servicio suspendido o inactivo a favoritos' })

        // Límite de 200 favoritos por usuario
        if (await verificarLimiteFavoritos(usuarioId))
            return res.status(403).json({
                success: false,
                message: 'Has alcanzado el límite máximo de 200 favoritos. Elimina algunos para continuar.'
            })

        const favorite = new Favorite({
            usuarioId,
            servicioId: servicioId.toString().trim(),
            notes: notes || null,
            notificationEnabled: notificationEnabled || false,
            lastInteractionAt: new Date()
        })

        await favorite.save()
        await syncFavoritesCount(servicioId)

        return res.status(201).json({ success: true, message: 'Servicio agregado a favoritos', favorite })

    } catch (error) {
        if (error.code === 11000)
            return res.status(409).json({ success: false, message: 'Este servicio ya está en tus favoritos' })
        return res.status(500).json({ success: false, message: 'Error al agregar favorito', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSULTAS
// ─────────────────────────────────────────────────────────────────────────────

export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find()
            .populate('servicioId', 'nombre descripcion ubicacion promedioCalificacion estado favoritosCount')
            .sort({ createdAt: -1 })

        return res.status(200).json({ success: true, total: favorites.length, favorites })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener favoritos', error: error.message })
    }
}

export const getFavoriteById = async (req, res) => {
    try {
        const favorite = await Favorite.findById(req.params.id)
            .populate('servicioId', 'nombre descripcion ubicacion promedioCalificacion estado favoritosCount')

        if (!favorite)
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' })

        return res.status(200).json({ success: true, favorite })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener el favorito', error: error.message })
    }
}

export const getFavoritesByUser = async (req, res) => {
    try {
        const usuarioId = Number(req.params.usuarioId)
        const { soloActivos, soloAbandonados } = req.query

        const filter = { usuarioId }
        if (soloAbandonados === 'true') filter.abandonado = true
        else if (soloActivos === 'true') filter.abandonado = false

        const favorites = await Favorite.find(filter)
            .populate('servicioId', 'nombre descripcion ubicacion promedioCalificacion estado favoritosCount categoriaId')
            .sort({ createdAt: -1 })

        return res.status(200).json({ success: true, total: favorites.length, favorites })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener favoritos del usuario', error: error.message })
    }
}

export const countFavoritesByService = async (req, res) => {
    try {
        const { servicioId } = req.params

        const service = await Service.findById(servicioId)
        if (!service)
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

        const count = await Favorite.countDocuments({ servicioId })

        return res.status(200).json({ success: true, servicioId, vecesGuardado: count })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al contar favoritos del servicio', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR / ELIMINAR
// ─────────────────────────────────────────────────────────────────────────────

export const updateFavorite = async (req, res) => {
    try {
        const { notes, notificationEnabled } = req.body

        const update = { lastInteractionAt: new Date(), abandonado: false }
        if (notes !== undefined) update.notes = notes
        if (notificationEnabled !== undefined) update.notificationEnabled = notificationEnabled

        const favorite = await Favorite.findByIdAndUpdate(
            req.params.id, update, { new: true, runValidators: true }
        )
        if (!favorite)
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' })

        return res.status(200).json({ success: true, message: 'Favorito actualizado correctamente', favorite })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al actualizar favorito', error: error.message })
    }
}

export const deleteFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findByIdAndDelete(req.params.id)
        if (!favorite)
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' })

        await syncFavoritesCount(favorite.servicioId)

        return res.status(200).json({ success: true, message: 'Favorito eliminado correctamente' })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al eliminar favorito', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUGERENCIAS Y POPULARIDAD
// ─────────────────────────────────────────────────────────────────────────────

export const getSuggestions = async (req, res) => {
    try {
        const uid = Number(req.params.usuarioId)
        const suggestions = await generarRecomendaciones(uid)

        if (suggestions.length === 0)
            return res.status(200).json({
                success: true,
                message: 'Aún no tienes favoritos o no hay sugerencias disponibles.',
                suggestions: []
            })

        return res.status(200).json({ success: true, total: suggestions.length, suggestions })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener sugerencias', error: error.message })
    }
}

export const getServicePopularity = async (req, res) => {
    try {
        const { servicioId } = req.params

        const service = await Service.findById(servicioId)
        if (!service)
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

        const popularidad = await calcularPopularidad(servicioId)

        return res.status(200).json({ success: true, servicioId, ...popularidad })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al calcular popularidad', error: error.message })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERACCIÓN Y TAREA ADMINISTRATIVA
// ─────────────────────────────────────────────────────────────────────────────

export const trackInteraction = async (req, res) => {
    try {
        const favorite = await Favorite.findById(req.params.id)
        if (!favorite)
            return res.status(404).json({ success: false, message: 'Favorito no encontrado' })

        await registrarInteraccion(req.params.id)

        return res.status(200).json({ success: true, message: 'Interacción registrada correctamente' })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al registrar interacción', error: error.message })
    }
}

export const runAbandonedCheck = async (req, res) => {
    try {
        const cantidad = await detectarFavoritosAbandonados()
        return res.status(200).json({
            success: true,
            message: `Revisión completada. ${cantidad} favorito(s) marcado(s) como abandonados.`,
            marcados: cantidad
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al detectar favoritos abandonados', error: error.message })
    }
}