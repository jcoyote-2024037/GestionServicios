'use strict'

const ESTADOS_VALIDOS = ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'expired']

export const solicitudesValidator = (req, res, next) => {
    const { servicioId, descripcion, priceEstimate, scheduledDate } = req.body

    if (!servicioId || servicioId.toString().trim().length === 0) {
        return res.status(400).json({ success: false, message: 'El servicioId es obligatorio' })
    }

    if (!descripcion || descripcion.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'La descripción es obligatoria' })
    }

    if (descripcion.trim().length > 1000) {
        return res.status(400).json({ success: false, message: 'La descripción no puede superar los 1000 caracteres' })
    }

    if (priceEstimate !== undefined && (isNaN(priceEstimate) || Number(priceEstimate) < 0)) {
        return res.status(400).json({ success: false, message: 'priceEstimate debe ser un número mayor o igual a 0' })
    }

    if (scheduledDate) {
        const fecha = new Date(scheduledDate)
        if (isNaN(fecha.getTime())) {
            return res.status(400).json({ success: false, message: 'scheduledDate no es una fecha válida' })
        }
        if (fecha <= new Date()) {
            return res.status(400).json({ success: false, message: 'La fecha programada debe ser una fecha futura' })
        }
    }

    next()
}

export const cambioEstadoValidator = (req, res, next) => {
    const { nuevoEstado } = req.body

    if (!nuevoEstado) {
        return res.status(400).json({ success: false, message: 'El campo nuevoEstado es obligatorio' })
    }

    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
        return res.status(400).json({
            success: false,
            message: `Estado inválido. Los estados permitidos son: ${ESTADOS_VALIDOS.join(', ')}`
        })
    }

    next()
}
