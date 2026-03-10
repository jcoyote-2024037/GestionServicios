'use strict'

import Favorite from './favorites.model.js'
import Service from '../services/services.model.js'
import { syncFavoritesCount } from '../../../helpers/favoritesHelper.js'

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

export const createFavorite = async (req, res) => {
    try {
        const { usuarioId, servicioId, notes, notificationEnabled } = req.body

        const service = await Service.findById(servicioId)
        if (!service)
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' })

        const favorite = new Favorite({
            usuarioId, servicioId,
            notes: notes || null,
            notificationEnabled: notificationEnabled || false
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
        const favorites = await Favorite.find({ usuarioId: Number(req.params.usuarioId) })
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

export const updateFavorite = async (req, res) => {
    try {
        const { notes, notificationEnabled } = req.body

        const update = {}
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

export const getSuggestions = async (req, res) => {
    try {
        const uid = Number(req.params.usuarioId)

        const userFavorites = await Favorite.find({ usuarioId: uid }).select('servicioId')
        const favServiceIds = userFavorites.map(f => f.servicioId)

        if (favServiceIds.length === 0)
            return res.status(200).json({
                success: true,
                message: 'Aún no tienes favoritos. Agrega servicios para recibir sugerencias.',
                suggestions: []
            })

        // Obtener categorías de los servicios favoritos
        const favServices = await Service.find({ _id: { $in: favServiceIds } }).select('categoriaId')
        const categoryIds = [...new Set(favServices.map(s => s.categoriaId?.toString()).filter(Boolean))]

        // Sugerir servicios activos de las mismas categorías que no estén en favoritos
        const suggestions = await Service.find({
            categoriaId: { $in: categoryIds },
            _id: { $nin: favServiceIds },
            estado: 'activo'
        })
            .limit(10)
            .select('nombre descripcion promedioCalificacion categoriaId locationId favoritosCount')

        return res.status(200).json({
            success: true,
            total: suggestions.length,
            basadoEn: favServiceIds.length,
            suggestions
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener sugerencias', error: error.message })
    }
}