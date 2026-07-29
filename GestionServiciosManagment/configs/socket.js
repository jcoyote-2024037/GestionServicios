'use strict'

import jwt from 'jsonwebtoken'

export const setupSocket = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token
        if (!token) return next(new Error('Token requerido'))

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            socket.userId = decoded.sub
            socket.userRole = decoded.role
            next()
        } catch {
            next(new Error('Token inválido'))
        }
    })

    io.on('connection', (socket) => {
        socket.join(`user_${socket.userId}`)

        socket.on('join_chat', (roomId) => {
            socket.join(roomId)
        })

        socket.on('leave_chat', (roomId) => {
            socket.leave(roomId)
        })

        socket.on('disconnect', () => {})
    })
}
