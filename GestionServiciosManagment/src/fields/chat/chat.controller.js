'use strict'

import ChatRoom from './chat.model.js'
import Message from './message.model.js'
import Solicitud from '../solicitudes/solicitudes.model.js'
import Notification from '../notifications/notification.model.js'
import User from '../user/user.model.js'

export const initChat = async (req, res) => {
    try {
        const { solicitudId } = req.params

        const solicitud = await Solicitud.findById(solicitudId)
        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
        }

        if (!['ADMIN_ROLE', 'DUENO_ROLE', 'USER_ROLE'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para iniciar el chat' })
        }

        if (solicitud.proveedorId !== req.user.id && solicitud.usuarioId !== req.user.id && req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ success: false, message: 'No participas en esta solicitud' })
        }

    let room = await ChatRoom.findOne({ solicitudId })

    if (!room) {
        room = await ChatRoom.create({
            solicitudId,
            servicioId: solicitud.servicioId,
            clienteId: solicitud.usuarioId,
            proveedorId: solicitud.proveedorId
        })
        await Solicitud.findByIdAndUpdate(solicitudId, { chatEnabled: true })
    }

        return res.status(200).json({ success: true, room })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al iniciar chat', error: error.message })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { roomId } = req.params
        const { text } = req.body

        if (!text?.trim()) {
            return res.status(400).json({ success: false, message: 'El mensaje no puede estar vacío' })
        }

        const room = await ChatRoom.findById(roomId)
        if (!room) {
            return res.status(404).json({ success: false, message: 'Chat no encontrado' })
        }

        if (room.clienteId !== req.user.id && room.proveedorId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No participas en este chat' })
        }

        const message = await Message.create({
            chatRoomId: roomId,
            from: req.user.id,
            text: text.trim()
        })

        room.lastMessage = text.trim().substring(0, 100)
        room.lastMessageAt = new Date()
        room.lastSenderId = req.user.id
        await room.save()

        const populated = await Message.findById(message._id).lean()

        if (req.app.get('io')) {
            const io = req.app.get('io')
            io.to(roomId).emit('new_message', populated)
            const targetId = req.user.id === room.clienteId ? room.proveedorId : room.clienteId
            io.to(`user_${targetId}`).emit('chat_notification', { roomId, solicitudId: room.solicitudId, text: text.trim().substring(0, 80), from: req.user.id })

            await Notification.create({
                usuarioId: targetId,
                tipo: 'chat_notification',
                titulo: 'Nuevo mensaje',
                mensaje: text.trim().substring(0, 80),
                referenciaId: room.solicitudId?.toString() || '',
                metadata: { roomId, solicitudId: room.solicitudId }
            })
        }

        return res.status(201).json({ success: true, message: populated })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al enviar mensaje', error: error.message })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params
        const { page = 1, limit = 50 } = req.query

        const room = await ChatRoom.findById(roomId)
        if (!room) {
            return res.status(404).json({ success: false, message: 'Chat no encontrado' })
        }

        if (room.clienteId !== req.user.id && room.proveedorId !== req.user.id && req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ success: false, message: 'No participas en este chat' })
        }

        const safePage = Math.max(parseInt(page) || 1, 1)
        const safeLimit = Math.max(parseInt(limit) || 50, 1)
        const skip = (safePage - 1) * safeLimit

        const [messages, total] = await Promise.all([
            Message.find({ chatRoomId: roomId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean(),
            Message.countDocuments({ chatRoomId: roomId })
        ])

        if (req.user.id !== room.clienteId) {
            await Message.updateMany(
                { chatRoomId: roomId, from: { $ne: req.user.id }, read: false },
                { read: true }
            )
        }

        return res.status(200).json({
            success: true,
            messages: messages.reverse(),
            pagination: {
                currentPage: safePage,
                totalPages: Math.ceil(total / safeLimit),
                totalRecords: total,
                limit: safeLimit
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener mensajes', error: error.message })
    }
}

export const getMyChats = async (req, res) => {
    try {
        const rooms = await ChatRoom.find({
            $or: [{ clienteId: req.user.id }, { proveedorId: req.user.id }]
        })
            .populate('solicitudId')
            .sort({ lastMessageAt: -1 })
            .lean()

        const userIds = [...new Set(rooms.flatMap(r => [r.clienteId, r.proveedorId]))]
        const users = userIds.length > 0
            ? await User.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'surname'] })
            : []
        const userMap = Object.fromEntries(users.map(u => [u.id, `${u.name} ${u.surname}`.trim()]))

        const result = await Promise.all(rooms.map(async (r) => {
            const unread = await Message.countDocuments({ chatRoomId: r._id, from: { $ne: req.user.id }, read: false })
            return {
                ...r,
                clienteNombre: userMap[r.clienteId] || 'Usuario',
                proveedorNombre: userMap[r.proveedorId] || 'Proveedor',
                unread
            }
        }))

        return res.status(200).json({ success: true, rooms: result })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener chats', error: error.message })
    }
}
