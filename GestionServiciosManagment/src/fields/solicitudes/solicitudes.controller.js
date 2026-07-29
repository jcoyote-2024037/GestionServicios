'use strict'

import Solicitud from './solicitudes.model.js'
import Service from '../services/services.model.js'
import User from '../user/user.model.js'
import { estadosPermitidos, notificarProveedor, expirarSolicitudesPendientes } from '../../../helpers/solicitudes.helper.js'
import { formatearSolicitud } from '../../../utils/solicitudes.util.js'

const attachUserInfo = async (solicitudes) => {
    const list = Array.isArray(solicitudes) ? solicitudes : [solicitudes]
    const userIds = [...new Set(list.map(s => s.usuarioId).filter(Boolean))]

    let userMap = {}
    if (userIds.length > 0) {
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'name', 'surname', 'email', 'phone', 'username']
        })
        userMap = Object.fromEntries(users.map(u => [u.id, u]))
    }

    const result = list.map(s => {
        const formatted = formatearSolicitud(s)
        const user = userMap[s.usuarioId]
        if (user) {
            formatted.usuario = {
                name: `${user.name} ${user.surname}`.trim(),
                email: user.email,
                phone: user.phone || '',
                username: user.username,
            }
        }
        return formatted
    })

    return Array.isArray(solicitudes) ? result : result[0]
}

/* ===========================
   CREAR SOLICITUD
=========================== */
export const createSolicitud = async (req, res) => {
    try {
        const { servicioId, descripcion, priceEstimate, scheduledDate, chatEnabled } = req.body
        const usuarioId = req.user.id

        // Validar fecha futura si se proporciona
        if (scheduledDate && new Date(scheduledDate) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'La fecha programada debe ser una fecha futura'
            })
        }

        const servicio = await Service.findById(servicioId)
        if (!servicio) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' })
        }

        const solicitud = new Solicitud({
            usuarioId,
            proveedorId: servicio.usuarioId || null,
            servicioId,
            descripcion,
            status: 'pending',
            estado: 'pendiente',
            priceEstimate: priceEstimate || null,
            scheduledDate: scheduledDate || null,
            chatEnabled: chatEnabled || false,
            fechaSolicitud: new Date(),
            historialEstados: [
                {
                    estado: 'pending',
                    cambiadoPor: usuarioId,
                    fecha: new Date(),
                    observacion: 'Solicitud creada'
                }
            ]
        })

        await solicitud.save()

        // Notificar al proveedor si tiene email registrado
        if (servicio.usuarioId) {
            const proveedor = await User.findOne({ id: servicio.usuarioId })
            if (proveedor?.email) {
                await notificarProveedor(proveedor.email, {
                    nombreServicio: servicio.nombre,
                    descripcion,
                    scheduledDate,
                    priceEstimate
                })
            }
        }

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
        const { page = 1, limit = 10, status, estado } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        const filtro = {}
        if (status) filtro.status = status
        else if (estado) filtro.estado = estado

        if (req.user.role === 'DUENO_ROLE') {
            filtro.proveedorId = req.user.id
        }

        const [solicitudes, total] = await Promise.all([
            Solicitud.find(filtro)
                .populate('servicioId')
                .sort({ fechaSolicitud: -1 })
                .skip(offset)
                .limit(safeLimit),
            Solicitud.countDocuments(filtro)
        ])

        let data
        try {
            data = await attachUserInfo(solicitudes)
        } catch {
            data = solicitudes.map(s => formatearSolicitud(s))
        }

        return res.status(200).json({
            success: true,
            data,
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
        const solicitud = await Solicitud.findById(req.params.id).populate('servicioId')

        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
        }

        let result
        try {
            result = await attachUserInfo(solicitud)
        } catch {
            result = formatearSolicitud(solicitud)
        }

        return res.status(200).json({ success: true, solicitud: result })
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
        const { descripcion, priceEstimate, scheduledDate, chatEnabled } = req.body
        const usuarioId = req.user.id

        const solicitud = await Solicitud.findById(id)
        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
        }

        if (solicitud.usuarioId !== usuarioId && req.user.role !== 'ADMIN_ROLE' && req.user.role !== 'DUENO_ROLE') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para editar esta solicitud' })
        }

        if (solicitud.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Solo se puede editar una solicitud en estado pending' })
        }

        if (scheduledDate && new Date(scheduledDate) <= new Date()) {
            return res.status(400).json({ success: false, message: 'La fecha programada debe ser una fecha futura' })
        }

        if (descripcion)           solicitud.descripcion   = descripcion
        if (priceEstimate != null)  solicitud.priceEstimate = priceEstimate
        if (scheduledDate)          solicitud.scheduledDate = scheduledDate
        if (chatEnabled != null)    solicitud.chatEnabled   = chatEnabled

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
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
        }

        if (solicitud.usuarioId !== usuarioId && req.user.role !== 'ADMIN_ROLE' && req.user.role !== 'DUENO_ROLE') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta solicitud' })
        }

        await Solicitud.findByIdAndDelete(id)

        return res.status(200).json({ success: true, message: 'Solicitud eliminada correctamente' })
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
        const { nuevoEstado, observacion, cancelReason } = req.body
        const usuarioId = req.user.id
        const rol       = req.user.role

        const solicitud = await Solicitud.findById(id)
        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
        }

        // Verificar si el usuario que hace la acción es el proveedor del servicio
        const esProveedor = solicitud.proveedorId && solicitud.proveedorId === usuarioId

        // Solo el proveedor puede aceptar (regla de negocio)
        if (nuevoEstado === 'accepted' && !esProveedor && rol !== 'ADMIN_ROLE' && rol !== 'DUENO_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Solo el proveedor del servicio puede aceptar una solicitud'
            })
        }

        const error = estadosPermitidos(solicitud.status, nuevoEstado, rol, esProveedor)
        if (error) {
            return res.status(400).json({ success: false, message: error })
        }

        // Actualizar timestamps según estado
        if (nuevoEstado === 'accepted')  solicitud.acceptedAt  = new Date()
        if (nuevoEstado === 'completed') solicitud.completedAt = new Date()
        if (['cancelled', 'rejected'].includes(nuevoEstado) && cancelReason) {
            solicitud.cancelReason = cancelReason
        }

        solicitud.status = nuevoEstado
        // Sincronizar campo legacy
        const mapaLegacy = { pending: 'pendiente', accepted: 'aceptado', rejected: 'rechazado', completed: 'completado', cancelled: 'rechazado', expired: 'rechazado' }
        solicitud.estado = mapaLegacy[nuevoEstado] ?? 'pendiente'

        solicitud.historialEstados.push({
            estado:      nuevoEstado,
            cambiadoPor: usuarioId,
            fecha:       new Date(),
            observacion: observacion || cancelReason || ''
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
        const { page = 1, limit = 10, status, estado } = req.query

        const safePage  = Math.max(parseInt(page, 10)  || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1)
        const offset    = (safePage - 1) * safeLimit

        if (parseInt(usuarioId) !== req.user.id && req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver este historial' })
        }

        const filtro = { usuarioId: parseInt(usuarioId) }
        if (status) filtro.status = status
        else if (estado) filtro.estado = estado

        const [solicitudes, total] = await Promise.all([
            Solicitud.find(filtro)
                .populate('servicioId')
                .sort({ fechaSolicitud: -1 })
                .skip(offset)
                .limit(safeLimit),
            Solicitud.countDocuments(filtro)
        ])

        let data
        try {
            data = await attachUserInfo(solicitudes)
        } catch {
            data = solicitudes.map(s => formatearSolicitud(s))
        }

        return res.status(200).json({
            success: true,
            data,
            pagination: { currentPage: safePage, totalPages: Math.ceil(total / safeLimit), totalRecords: total, limit: safeLimit }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener el historial por usuario', error: error.message })
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
            pagination: { currentPage: safePage, totalPages: Math.ceil(total / safeLimit), totalRecords: total, limit: safeLimit }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener el historial por servicio', error: error.message })
    }
}

/* ===========================
   EXPIRAR SOLICITUDES (admin / cron)
=========================== */
export const expirarSolicitudes = async (req, res) => {
    try {
        const cantidad = await expirarSolicitudesPendientes(Solicitud)

        return res.status(200).json({
            success: true,
            message: `${cantidad} solicitud(es) marcada(s) como expiradas`
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al expirar solicitudes', error: error.message })
    }
}
