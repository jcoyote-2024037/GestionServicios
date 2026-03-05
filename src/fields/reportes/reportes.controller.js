'use strict'

import Reporte from './reportes.model.js'
import Service from '../services/services.model.js'
import { formatearReporte } from '../../../utils/reportes.util.js'

/* ===========================
   CREAR REPORTE
=========================== */
export const createReporte = async (req, res) => {
    try {
        const { servicioId, motivo, descripcion } = req.body
        const usuarioId = req.user.id // extraído del JWT

        // Verificar que el servicio existe
        const servicio = await Service.findById(servicioId)
        if (!servicio) {
            return res.status(404).json({
                success: false,
                message: 'El servicio reportado no existe'
            })
        }

        // Evitar que un usuario reporte el mismo servicio más de una vez pendiente
        const reportePrevio = await Reporte.findOne({
            servicioId,
            usuarioId,
            estado: 'pendiente'
        })

        if (reportePrevio) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes un reporte pendiente para este servicio'
            })
        }

        const reporte = new Reporte({
            servicioId,
            usuarioId,
            motivo,
            descripcion,
            fecha: new Date()
        })

        await reporte.save()

        return res.status(201).json({
            success: true,
            message: 'Reporte enviado correctamente',
            reporte: formatearReporte(reporte)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear el reporte',
            error: error.message
        })
    }
}

/* ===========================
   OBTENER TODOS (admin)
=========================== */
export const getReportes = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado, motivo } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        const filtro = {}
        if (estado) filtro.estado = estado
        if (motivo) filtro.motivo = motivo

        const [reportes, total] = await Promise.all([
            Reporte.find(filtro)
                .populate('servicioId')
                .sort({ fecha: -1 })
                .skip(offset)
                .limit(safeLimit),
            Reporte.countDocuments(filtro)
        ])

        return res.status(200).json({
            success: true,
            data: reportes.map(formatearReporte),
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
            message: 'Error al obtener los reportes',
            error: error.message
        })
    }
}

/* ===========================
   OBTENER POR ID
=========================== */
export const getReporteById = async (req, res) => {
    try {
        const { id } = req.params

        const reporte = await Reporte.findById(id).populate('servicioId')

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            reporte: formatearReporte(reporte)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte',
            error: error.message
        })
    }
}

/* ===========================
   ACTUALIZAR REPORTE (admin)
=========================== */
export const updateReporte = async (req, res) => {
    try {
        const { id } = req.params
        const { motivo, descripcion } = req.body

        const reporte = await Reporte.findById(id)

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            })
        }

        // Solo se puede editar si está pendiente
        if (reporte.estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'No se puede editar un reporte ya revisado'
            })
        }

        reporte.motivo      = motivo      ?? reporte.motivo
        reporte.descripcion = descripcion ?? reporte.descripcion

        await reporte.save()

        return res.status(200).json({
            success: true,
            message: 'Reporte actualizado',
            reporte: formatearReporte(reporte)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el reporte',
            error: error.message
        })
    }
}

/* ===========================
   ELIMINAR REPORTE (admin)
=========================== */
export const deleteReporte = async (req, res) => {
    try {
        const { id } = req.params

        const reporte = await Reporte.findByIdAndDelete(id)

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Reporte eliminado correctamente'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el reporte',
            error: error.message
        })
    }
}

/* ===========================
   LISTAR REPORTES PENDIENTES
=========================== */
export const getReportesPendientes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        const [reportes, total] = await Promise.all([
            Reporte.find({ estado: 'pendiente' })
                .populate('servicioId')
                .sort({ fecha: 1 }) // más antiguos primero
                .skip(offset)
                .limit(safeLimit),
            Reporte.countDocuments({ estado: 'pendiente' })
        ])

        return res.status(200).json({
            success: true,
            data: reportes.map(formatearReporte),
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
            message: 'Error al obtener reportes pendientes',
            error: error.message
        })
    }
}

/* ===========================
   MARCAR REPORTE COMO REVISADO
   + Marcar servicio "en revisión"
=========================== */
export const marcarComoRevisado = async (req, res) => {
    try {
        const { id } = req.params
        const { notaRevision } = req.body
        const adminId = req.user.id

        const reporte = await Reporte.findById(id)

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            })
        }

        if (reporte.estado === 'revisado') {
            return res.status(400).json({
                success: false,
                message: 'Este reporte ya fue revisado'
            })
        }

        // Actualizar el reporte
        reporte.estado        = 'revisado'
        reporte.revisadoPor   = adminId
        reporte.fechaRevision = new Date()
        reporte.notaRevision  = notaRevision || null

        await reporte.save()

        // Marcar el servicio como "en revisión" (estado: inactivo con nota)
        await Service.findByIdAndUpdate(
            reporte.servicioId,
            { estado: 'inactivo' },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: 'Reporte marcado como revisado y servicio desactivado',
            reporte: formatearReporte(reporte)
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al marcar reporte como revisado',
            error: error.message
        })
    }
}
