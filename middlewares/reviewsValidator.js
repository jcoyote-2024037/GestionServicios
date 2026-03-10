'use strict'

export const reviewsValidator = (req, res, next) => {
    const { servicioId, usuarioId, calificacion, comentario, title } = req.body

    if (!servicioId)
        return res.status(400).json({ success: false, message: 'El servicioId es obligatorio' })

    if (!usuarioId)
        return res.status(400).json({ success: false, message: 'El usuarioId es obligatorio' })

    if (typeof usuarioId !== 'number' || !Number.isInteger(usuarioId))
        return res.status(400).json({ success: false, message: 'El usuarioId debe ser un número entero' })

    if (calificacion === undefined || calificacion === null)
        return res.status(400).json({ success: false, message: 'La calificación es obligatoria' })

    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5)
        return res.status(400).json({ success: false, message: 'La calificación debe ser un número entero entre 1 y 5' })

    if (!comentario || comentario.trim().length === 0)
        return res.status(400).json({ success: false, message: 'El comentario es obligatorio' })

    if (comentario.trim().length < 20)
        return res.status(400).json({ success: false, message: 'El comentario debe tener al menos 20 caracteres' })

    if (comentario.length > 1000)
        return res.status(400).json({ success: false, message: 'El comentario no puede superar los 1000 caracteres' })

    if (title !== undefined && title !== null) {
        if (typeof title !== 'string' || title.trim().length === 0)
            return res.status(400).json({ success: false, message: 'El título no puede estar vacío si se envía' })
        if (title.length > 150)
            return res.status(400).json({ success: false, message: 'El título no puede superar los 150 caracteres' })
    }

    next()
}

export const reviewsUpdateValidator = (req, res, next) => {
    const { calificacion, comentario, title } = req.body

    if (calificacion === undefined && comentario === undefined && title === undefined)
        return res.status(400).json({
            success: false,
            message: 'Debe enviar al menos un campo para actualizar (calificacion, comentario o title)'
        })

    if (calificacion !== undefined) {
        if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5)
            return res.status(400).json({ success: false, message: 'La calificación debe ser un número entero entre 1 y 5' })
    }

    if (comentario !== undefined) {
        if (comentario.trim().length < 20)
            return res.status(400).json({ success: false, message: 'El comentario debe tener al menos 20 caracteres' })
        if (comentario.length > 1000)
            return res.status(400).json({ success: false, message: 'El comentario no puede superar los 1000 caracteres' })
    }

    if (title !== undefined && title !== null) {
        if (typeof title !== 'string' || title.trim().length === 0)
            return res.status(400).json({ success: false, message: 'El título no puede estar vacío si se envía' })
        if (title.length > 150)
            return res.status(400).json({ success: false, message: 'El título no puede superar los 150 caracteres' })
    }

    next()
}