'use strict'

const ESTADOS_VALIDOS = ['pendiente', 'aceptado', 'rechazado', 'completado']

export const solicitudesValidator = (req, res, next) => {
    const { servicioId, descripcion } = req.body

    if (!servicioId || servicioId.toString().trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El servicioId es obligatorio'
        })
    }

    if (!descripcion || descripcion.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'La descripción es obligatoria'
        })
    }

    if (descripcion.trim().length > 1000) {
        return res.status(400).json({
            success: false,
            message: 'La descripción no puede superar los 1000 caracteres'
        })
    }

    next()
}

export const cambioEstadoValidator = (req, res, next) => {
    const { nuevoEstado } = req.body

    if (!nuevoEstado) {
        return res.status(400).json({
            success: false,
            message: 'El campo nuevoEstado es obligatorio'
        })
    }

    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
        return res.status(400).json({
            success: false,
            message: `Estado inválido. Los estados permitidos son: ${ESTADOS_VALIDOS.join(', ')}`
        })
    }

    next()
}
