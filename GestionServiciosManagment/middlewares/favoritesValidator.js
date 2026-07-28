'use strict'

export const favoritesValidator = (req, res, next) => {
    const { servicioId, notes } = req.body

    if (!servicioId)
        return res.status(400).json({ success: false, message: 'El servicioId es obligatorio' })

    const servicioIdStr = String(servicioId).trim()
    if (servicioIdStr.length === 0)
        return res.status(400).json({ success: false, message: 'El servicioId no puede estar vacío' })
    req.body.servicioId = servicioIdStr

    if (notes !== undefined && notes !== null) {
        if (typeof notes !== 'string' || notes.trim().length === 0)
            return res.status(400).json({ success: false, message: 'Las notas no pueden estar vacías si se envían' })
        if (notes.length > 300)
            return res.status(400).json({ success: false, message: 'Las notas no pueden superar los 300 caracteres' })
    }

    next()
}

export const favoritesUpdateValidator = (req, res, next) => {
    const { notes, notificationEnabled } = req.body

    if (notes === undefined && notificationEnabled === undefined)
        return res.status(400).json({
            success: false,
            message: 'Debe enviar al menos notes o notificationEnabled para actualizar'
        })

    if (notes !== undefined && notes !== null) {
        if (typeof notes !== 'string' || notes.trim().length === 0)
            return res.status(400).json({ success: false, message: 'Las notas no pueden estar vacías si se envían' })
        if (notes.length > 300)
            return res.status(400).json({ success: false, message: 'Las notas no pueden superar los 300 caracteres' })
    }

    if (notificationEnabled !== undefined && typeof notificationEnabled !== 'boolean')
        return res.status(400).json({ success: false, message: 'notificationEnabled debe ser un booleano (true/false)' })

    next()
}