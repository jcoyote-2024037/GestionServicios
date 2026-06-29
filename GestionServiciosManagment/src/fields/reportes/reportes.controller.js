'use strict'

import Reporte from './reportes.model.js'
import Service from '../services/services.model.js'
import User from '../user/user.model.js'
import { formatearReporte } from '../../../utils/reportes.util.js'
import {
    verificarUmbralYSuspender,
    notificarAdmins
} from '../../../helpers/reportes.helper.js'

/* ===========================
   CREAR REPORTE
=========================== */
export const createReporte = async (req, res) => {
    try {
        const { servicioId, motivo, reportType, descripcion, severity } = req.body
        const usuarioId = req.user.id

        const servicio = await Service.findById(servicioId)
        if (!servicio) {
            return res.status(404).json({ success: false, message: 'El servicio reportado no existe' })
        }

        // Evitar reporte duplicado pendiente del mismo usuario
        const reportePrevio = await Reporte.findOne({ servicioId, usuarioId, status: 'pending' })
        if (reportePrevio) {
            return res.status(400).json({ success: false, message: 'Ya tienes un reporte pendiente para este servicio' })
        }

        const reporte = new Reporte({
            servicioId,
            usuarioId,
            motivo,
            reportType,
            descripcion,
            severity: severity || 'medium',
            status: 'pending',
            estado: 'pendiente',
            fecha: new Date()
        })

        await reporte.save()

        // Verificar umbral de reportes → suspender servicio automáticamente
        const suspendido = await verificarUmbralYSuspender(Reporte, Service, servicioId)

        // Notificar admins si se suspendió o si el reporte es crítico
        if (suspendido || severity === 'critical') {
            const admins = await User.findAll({ where: { role: 'ADMIN_ROLE', status: true } })
            const emails = admins.map(a => a.email).filter(Boolean)
            const motivoAlerta = suspendido
                ? `Servicio suspendido automáticamente por superar el umbral de reportes`
                : `Reporte crítico recibido`
            await notificarAdmins(emails, reporte, motivoAlerta)
        }

        return res.status(201).json({
            success: true,
            message: suspendido
                ? 'Reporte enviado. El servicio fue suspendido automáticamente por superar el umbral de reportes.'
                : 'Reporte enviado correctamente',
            reporte: formatearReporte(reporte)
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al crear el reporte', error: error.message })
    }
}

/* ===========================
   OBTENER TODOS (admin)
=========================== */
export const getReportes = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, motivo, severity, reportType } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        const filtro = {}
        if (status)     filtro.status     = status
        if (motivo)     filtro.motivo     = motivo
        if (severity)   filtro.severity   = severity
        if (reportType) filtro.reportType = reportType

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
        return res.status(500).json({ success: false, message: 'Error al obtener los reportes', error: error.message })
    }
}

/* ===========================
   OBTENER POR ID
=========================== */
export const getReporteById = async (req, res) => {
    try {
        const reporte = await Reporte.findById(req.params.id).populate('servicioId')

        if (!reporte) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' })
        }

        return res.status(200).json({ success: true, reporte: formatearReporte(reporte) })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener el reporte', error: error.message })
    }
}

/* ===========================
   ACTUALIZAR REPORTE (admin)
=========================== */
export const updateReporte = async (req, res) => {
    try {
        const { id } = req.params
        const { motivo, descripcion, severity, reportType } = req.body

        const reporte = await Reporte.findById(id)
        if (!reporte) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' })
        }

        if (reporte.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'No se puede editar un reporte que ya no está pendiente' })
        }

        reporte.motivo      = motivo      ?? reporte.motivo
        reporte.descripcion = descripcion ?? reporte.descripcion
        reporte.severity    = severity    ?? reporte.severity
        reporte.reportType  = reportType  ?? reporte.reportType

        await reporte.save()

        return res.status(200).json({ success: true, message: 'Reporte actualizado', reporte: formatearReporte(reporte) })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al actualizar el reporte', error: error.message })
    }
}

/* ===========================
   ELIMINAR REPORTE (admin)
=========================== */
export const deleteReporte = async (req, res) => {
    try {
        const reporte = await Reporte.findByIdAndDelete(req.params.id)

        if (!reporte) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' })
        }

        return res.status(200).json({ success: true, message: 'Reporte eliminado correctamente' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al eliminar el reporte', error: error.message })
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
            Reporte.find({ status: 'pending' })
                .populate('servicioId')
                .sort({ fecha: 1 })
                .skip(offset)
                .limit(safeLimit),
            Reporte.countDocuments({ status: 'pending' })
        ])

        return res.status(200).json({
            success: true,
            data: reportes.map(formatearReporte),
            pagination: { currentPage: safePage, totalPages: Math.ceil(total / safeLimit), totalRecords: total, limit: safeLimit }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener reportes pendientes', error: error.message })
    }
}

/* ===========================
   REVISAR REPORTE (admin)
   Puede resolver o desestimar + opcionalmente suspender el servicio
=========================== */
export const marcarComoRevisado = async (req, res) => {
    try {
        const { id } = req.params
        const { notaRevision, resolution, nuevoStatus } = req.body
        const adminId = req.user.id

        const reporte = await Reporte.findById(id)
        if (!reporte) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' })
        }

        if (['resolved', 'dismissed'].includes(reporte.status)) {
            return res.status(400).json({ success: false, message: 'Este reporte ya fue revisado' })
        }

        const statusFinal = ['resolved', 'dismissed'].includes(nuevoStatus) ? nuevoStatus : 'resolved'

        reporte.status        = statusFinal
        reporte.estado        = 'revisado'
        reporte.reviewedBy    = adminId
        reporte.reviewedAt    = new Date()
        reporte.resolution    = resolution || null
        reporte.revisadoPor   = adminId
        reporte.fechaRevision = new Date()
        reporte.notaRevision  = notaRevision || null

        await reporte.save()

        // Si se resuelve → desactivar el servicio
        if (statusFinal === 'resolved') {
            await Service.findByIdAndUpdate(reporte.servicioId, { estado: 'inactivo' })
        }

        return res.status(200).json({
            success: true,
            message: statusFinal === 'resolved'
                ? 'Reporte resuelto y servicio desactivado'
                : 'Reporte desestimado',
            reporte: formatearReporte(reporte)
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al revisar el reporte', error: error.message })
    }
}
