'use strict'

import Notification from './notification.model.js'

export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query
        const safePage = Math.max(parseInt(page, 10) || 1, 1)
        const safeLimit = Math.max(parseInt(limit, 10) || 20, 1)
        const offset = (safePage - 1) * safeLimit

        const filtro = { usuarioId: req.user.id }

        const [notificaciones, total, noLeidas] = await Promise.all([
            Notification.find(filtro)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(safeLimit)
                .lean(),
            Notification.countDocuments(filtro),
            Notification.countDocuments({ usuarioId: req.user.id, leida: false })
        ])

        return res.status(200).json({
            success: true,
            data: notificaciones,
            noLeidas,
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
            message: 'Error al obtener notificaciones',
            error: error.message
        })
    }
}

export const marcarComoLeida = async (req, res) => {
    try {
        const notificacion = await Notification.findOneAndUpdate(
            { _id: req.params.id, usuarioId: req.user.id },
            { leida: true },
            { new: true }
        )

        if (!notificacion) {
            return res.status(404).json({ success: false, message: 'Notificación no encontrada' })
        }

        return res.status(200).json({ success: true, data: notificacion })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al marcar notificación',
            error: error.message
        })
    }
}

export const marcarTodasComoLeidas = async (req, res) => {
    try {
        await Notification.updateMany(
            { usuarioId: req.user.id, leida: false },
            { leida: true }
        )

        return res.status(200).json({ success: true, message: 'Todas marcadas como leídas' })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al marcar notificaciones',
            error: error.message
        })
    }
}

export const contarNoLeidas = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ usuarioId: req.user.id, leida: false })
        return res.status(200).json({ success: true, count })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al contar notificaciones',
            error: error.message
        })
    }
}
