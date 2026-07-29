'use strict'

import Service from './services.model.js'
import Location from '../location/location.model.js'
import User from '../user/user.model.js'

// Crear servicio
export const createService = async (req, res) => {
    try {

        const data = { ...req.body, usuarioId: req.user.id }

        if (typeof data.tags === 'string') {
            try { data.tags = JSON.parse(data.tags) } catch { data.tags = [] }
        }
        if (typeof data.availability === 'string') {
            try { data.availability = JSON.parse(data.availability) } catch { data.availability = [] }
        }

        if (req.files?.length) {
            data.imagenes = req.files.map(f => `/uploads/services/${f.filename}`)
        }

        const service = new Service(data)
        await service.save()

        return res.status(201).json({
            success: true,
            message: 'Servicio creado correctamente',
            service
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear servicio',
            error: error.message
        })
    }
}

// Obtener todos
export const getServices = async (req, res) => {
    try {

        const services = await Service.find()
            .populate('categoriaId')
            .populate('locationId')

        return res.status(200).json({
            success: true,
            services
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener servicios',
            error: error.message
        })
    }
}

// Obtener servicios del usuario autenticado (Dueño)
export const getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ usuarioId: req.user.id })
            .populate('categoriaId')
            .populate('locationId')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            services
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener tus servicios',
            error: error.message
        })
    }
}

// Obtener por ID
export const getServiceById = async (req, res) => {

    try {

        const { id } = req.params

        const service = await Service.findById(id)
            .populate('categoriaId')
            .populate('locationId')

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

        service.viewsCount += 1
        service.lastActivityAt = new Date()

        await service.save()

        return res.status(200).json({
            success: true,
            service
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Error al obtener servicio',
            error: error.message
        })

    }

}

// Actualizar
export const updateService = async (req, res) => {
    try {

        const { id } = req.params

        const service = await Service.findById(id)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

        if (req.user.role === 'DUENO_ROLE' && service.usuarioId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este servicio'
            })
        }

        const data = { ...req.body }

        if (typeof data.tags === 'string') {
            try { data.tags = JSON.parse(data.tags) } catch { delete data.tags }
        }
        if (typeof data.availability === 'string') {
            try { data.availability = JSON.parse(data.availability) } catch { delete data.availability }
        }

        if (req.files?.length) {
            data.imagenes = [
                ...(service.imagenes || []),
                ...req.files.map(f => `/uploads/services/${f.filename}`)
            ]
        }

        const updated = await Service.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true
            }
        )

        return res.status(200).json({
            success: true,
            message: 'Servicio actualizado',
            service: updated
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar servicio',
            error: error.message
        })
    }
}

// Eliminar (hard delete)
export const deleteService = async (req, res) => {
    try {

        const { id } = req.params

        const service = await Service.findById(id)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

        if (req.user.role === 'DUENO_ROLE' && service.usuarioId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este servicio'
            })
        }

        await Service.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: 'Servicio desactivado'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar servicio',
            error: error.message
        })
    }
}

export const getFeaturedServices = async (req,res)=>{

    try{

        const services = await Service.find({
            isFeatured: true,
            estado: 'activo'
        })
        .sort({ averageRating: -1 })

        return res.status(200).json({
            success:true,
            services
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:'Error obteniendo servicios destacados'
        })

    }

}

export const getPopularServices = async (req,res)=>{

    try{

        const services = await Service.find({ estado:'activo' })
        .sort({ viewsCount: -1 })
        .limit(10)

        return res.status(200).json({
            success:true,
            services
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:'Error obteniendo servicios populares'
        })

    }

}

// Cerca de mi
export const getNearbyServices = async (req, res) => {
    try {
        let { municipality, department, zona } = req.user

        if (!municipality && !department && !zona) {
            const user = await User.findByPk(req.user.id, {
                attributes: ['municipality', 'department', 'zona']
            })
            if (user) {
                municipality = user.municipality
                department = user.department
                zona = user.zona
            }
        }

        if (!municipality && !department && !zona) {
            return res.status(200).json({
                success: true,
                services: []
            })
        }

        const filtroLocation = {}
        if (municipality) filtroLocation.municipality = { $regex: `^${municipality.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        if (department) filtroLocation.department = { $regex: `^${department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        if (zona) filtroLocation.zona = { $regex: `^${zona.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }

        const locations = await Location.find(filtroLocation)
        const locationIds = locations.map(l => l._id)

        if (locationIds.length === 0) {
            return res.status(200).json({
                success: true,
                services: []
            })
        }

        const services = await Service.find({
            locationId: { $in: locationIds },
            estado: 'activo'
        })
            .populate('categoriaId')
            .populate('locationId')

        return res.status(200).json({
            success: true,
            services
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar servicios cercanos',
            error: error.message
        })
    }
}
