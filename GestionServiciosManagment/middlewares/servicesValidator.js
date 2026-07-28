'use strict'

import Service from '../src/fields/services/services.model.js'
import Category from '../src/fields/categories/categories.model.js'
import Location from '../src/fields/location/location.model.js'

export const servicesValidator = async (req, res, next) => {

    try {

        const {
            nombre,
            descripcion,
            categoriaId,
            locationId,
            telefono,
            contactEmail
        } = req.body

        // Campos obligatorios
        if (!nombre || !descripcion || !categoriaId || !locationId || !telefono) {
            return res.status(400).json({
                success: false,
                message: 'nombre, descripcion, categoriaId, locationId y telefono son obligatorios'
            })
        }

        // Longitud nombre
        if (nombre.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'El nombre no puede tener más de 100 caracteres'
            })
        }

        // Longitud descripción
        if (descripcion.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'La descripción no puede superar los 500 caracteres'
            })
        }

        // Validar teléfono
        const phoneRegex = /^\d{7,15}$/
        if (!phoneRegex.test(telefono)) {
            return res.status(400).json({
                success: false,
                message: 'El teléfono debe contener entre 7 y 15 dígitos'
            })
        }

        // Validar email si viene
        if (contactEmail) {

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            if (!emailRegex.test(contactEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido'
                })
            }

        }

        // Validar categoría existente
        const categoria = await Category.findById(categoriaId)

        if (!categoria) {
            return res.status(400).json({
                success: false,
                message: 'La categoría no existe'
            })
        }

        // Validar ubicación existente
        const location = await Location.findById(locationId)

        if (!location) {
            return res.status(400).json({
                success: false,
                message: 'La ubicación no existe'
            })
        }

        // Validar nombre único por proveedor
        const usuarioId = req.user.id

        const existingService = await Service.findOne({
            nombre,
            usuarioId
        })

        if (existingService) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes un servicio registrado con ese nombre'
            })
        }

        next()

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Error validando servicio',
            error: error.message
        })

    }
}