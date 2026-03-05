'use strict'

import Favorite from './favorites.model.js'
import Service from '../services/services.model.js'

export const createFavorite = async (req, res) => {
    try {
        const { usuarioId, servicioId } = req.body

        const service = await Service.findById(servicioId)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

        const favorite = new Favorite({ usuarioId, servicioId })
        await favorite.save()

        return res.status(201).json({
            success: true,
            message: 'Servicio agregado a favoritos',
            favorite
        })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Este servicio ya está en tus favoritos'
            })
        }
        return res.status(500).json({
            success: false,
            message: 'Error al agregar favorito',
            error: error.message
        })
    }
}

export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find()
            .populate('servicioId', 'nombre descripcion ubicacion promedioCalificacion estado')
            .sort({ fecha: -1 })

        return res.status(200).json({
            success: true,
            total: favorites.length,
            favorites
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos',
            error: error.message
        })
    }
}

export const getFavoriteById = async (req, res) => {
    try {
        const { id } = req.params

        const favorite = await Favorite.findById(id)
            .populate('servicioId', 'nombre descripcion ubicacion promedioCalificacion estado')

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            favorite
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el favorito',
            error: error.message
        })
    }
}

export const getFavoritesByUser = async (req, res) => {
    try {
        const { usuarioId } = req.params

        const favorites = await Favorite.find({ usuarioId: Number(usuarioId) })
            .populate('servicioId', 'nombre descripcion ubicacion promedioCalificacion estado')
            .sort({ fecha: -1 })

        return res.status(200).json({
            success: true,
            total: favorites.length,
            favorites
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos del usuario',
            error: error.message
        })
    }
}

export const countFavoritesByService = async (req, res) => {
    try {
        const { servicioId } = req.params

        const service = await Service.findById(servicioId)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

        const count = await Favorite.countDocuments({ servicioId })

        return res.status(200).json({
            success: true,
            servicioId,
            vecesGuardado: count
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al contar favoritos del servicio',
            error: error.message
        })
    }
}

export const deleteFavorite = async (req, res) => {
    try {
        const { id } = req.params

        const favorite = await Favorite.findByIdAndDelete(id)

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Favorito eliminado correctamente'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar favorito',
            error: error.message
        })
    }
}
