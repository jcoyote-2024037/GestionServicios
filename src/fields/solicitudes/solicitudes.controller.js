'use strict'

import Solicitud from './solicitudes.model.js'
import { estadosPermitidos } from '../../../helpers/solicitudes.helper.js'
import { formatearSolicitud } from '../../../utils/solicitudes.util.js'

/* ===========================
   CREAR SOLICITUD
=========================== */
export const createSolicitud = async (req, res) => {
    try {
        const { servicioId, descripcion } = req.body
        const usuarioId = req.user.id // extraído del JWT

        const solicitud = new Solicitud({
            usuarioId,
            servicioId,
            descripcion,
            fechaSolicitud: new Date(),
            historialEstados: [
                {
                    estado: 'pendiente',
                    cambiadoPor: usuarioId,
                    fecha: new Date(),
                    observacion: 'Solicitud creada'
                }
            ]
        })

        await solicitud.save()

        return res.status(201).json({
            success: true,
            message: 'Solicitud creada correctamente',
            solicitud: formatearSolicitud(solicitud)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear la solicitud',
            error: error.message
        })
    }
}

/* ===========================
   OBTENER TODAS
=========================== */
export const getSolicitudes = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        const filtro = {}
        if (estado) filtro.estado = estado

        const [solicitudes, total] = await Promise.all([
            Solicitud.find(filtro)
                .populate('servicioId')
                .sort({ fechaSolicitud: -1 })
                .skip(offset)
                .limit(safeLimit),
            Solicitud.countDocuments(filtro)
        ])

        return res.status(200).json({
            success: true,
            data: solicitudes.map(formatearSolicitud),
            pagination: {
                currentPage: safePage,
                totalPages: Math.ceil(total / safeLimit),
                totalRecords: total,
                limit: safeLimit
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las solicitudes',
            error: error.message
        })
    }
}

/* ===========================
   OBTENER POR ID
=========================== */
export const getSolicitudById = async (req, res) => {
    try {
        const { id } = req.params

        const solicitud = await Solicitud.findById(id).populate('servicioId')

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            })
        }

        return res.status(200).json({
            success: true,
            solicitud: formatearSolicitud(solicitud)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la solicitud',
            error: error.message
        })
    }
}

/* ===========================
   ACTUALIZAR SOLICITUD
=========================== */
export const updateSolicitud = async (req, res) => {
    try {
        const { id } = req.params
        const { descripcion } = req.body
        const usuarioId = req.user.id

        const solicitud = await Solicitud.findById(id)

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            })
        }

        // Solo el dueño puede editar la descripción
        if (solicitud.usuarioId !== usuarioId && req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar esta solicitud'
            })
        }

        // Solo se puede editar si está pendiente
        if (solicitud.estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'Solo se puede editar una solicitud en estado pendiente'
            })
        }

        solicitud.descripcion = descripcion
        await solicitud.save()

        return res.status(200).json({
            success: true,
            message: 'Solicitud actualizada',
            solicitud: formatearSolicitud(solicitud)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la solicitud',
            error: error.message
        })
    }
}

/* ===========================
   ELIMINAR SOLICITUD
=========================== */
export const deleteSolicitud = async (req, res) => {
    try {
        const { id } = req.params
        const usuarioId = req.user.id

        const solicitud = await Solicitud.findById(id)

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            })
        }

        // Solo el dueño o un admin puede eliminar
        if (solicitud.usuarioId !== usuarioId && req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta solicitud'
            })
        }

        await Solicitud.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: 'Solicitud eliminada correctamente'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la solicitud',
            error: error.message
        })
    }
}

/* ===========================
   CAMBIAR ESTADO (controlado)
=========================== */
export const cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params
        const { nuevoEstado, observacion } = req.body
        const usuarioId = req.user.id
        const rol = req.user.role

        const solicitud = await Solicitud.findById(id)

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            })
        }

        // Validar que la transición de estado sea permitida
        const error = estadosPermitidos(solicitud.estado, nuevoEstado, rol)
        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            })
        }

        solicitud.estado = nuevoEstado
        solicitud.historialEstados.push({
            estado: nuevoEstado,
            cambiadoPor: usuarioId,
            fecha: new Date(),
            observacion: observacion || ''
        })

        await solicitud.save()

        return res.status(200).json({
            success: true,
            message: `Estado cambiado a "${nuevoEstado}" correctamente`,
            solicitud: formatearSolicitud(solicitud)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        })
    }
}

/* ===========================
   HISTORIAL POR USUARIO
=========================== */
export const getHistorialPorUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params
        const { page = 1, limit = 10 } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        // Solo el mismo usuario o un admin puede ver su historial
        if (parseInt(usuarioId) !== req.user.id && req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este historial'
            })
        }

        const [solicitudes, total] = await Promise.all([
            Solicitud.find({ usuarioId: parseInt(usuarioId) })
                .populate('servicioId')
                .sort({ fechaSolicitud: -1 })
                .skip(offset)
                .limit(safeLimit),
            Solicitud.countDocuments({ usuarioId: parseInt(usuarioId) })
        ])

        return res.status(200).json({
            success: true,
            data: solicitudes.map(formatearSolicitud),
            pagination: {
                currentPage: safePage,
                totalPages: Math.ceil(total / safeLimit),
                totalRecords: total,
                limit: safeLimit
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial por usuario',
            error: error.message
        })
    }
}

/* ===========================
   HISTORIAL POR SERVICIO
=========================== */
export const getHistorialPorServicio = async (req, res) => {
    try {
        const { servicioId } = req.params
        const { page = 1, limit = 10 } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        const [solicitudes, total] = await Promise.all([
            Solicitud.find({ servicioId })
                .populate('servicioId')
                .sort({ fechaSolicitud: -1 })
                .skip(offset)
                .limit(safeLimit),
            Solicitud.countDocuments({ servicioId })
        ])

        return res.status(200).json({
            success: true,
            data: solicitudes.map(formatearSolicitud),
            pagination: {
                currentPage: safePage,
                totalPages: Math.ceil(total / safeLimit),
                totalRecords: total,
                limit: safeLimit
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial por servicio',
            error: error.message
        })
    }
}
