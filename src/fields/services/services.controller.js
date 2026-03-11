'use strict'

import Service from './services.model.js'

// Crear servicio
export const createService = async (req, res) => {
    try {

        const data = req.body

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

// Obtener por ID
export const getServiceById = async (req, res) => {

    try {

        const { id } = req.params

        const service = await Service.findById(id)
            .populate('categoriaId')

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

        const service = await Service.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Servicio actualizado',
            service
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar servicio',
            error: error.message
        })
    }
}

// Eliminar (soft delete)
export const deleteService = async (req, res) => {
    try {

        const { id } = req.params

        const service = await Service.findByIdAndUpdate(
            id,
            { estado: 'inactivo' },
            { new: true }
        )

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            })
        }

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