'use strict'

export const favoritesValidator = (req, res, next) => {

    const { usuarioId, servicioId } = req.body

    if (!usuarioId) {
        return res.status(400).json({
            success: false,
            message: 'El usuarioId es obligatorio'
        })
    }

    if (typeof usuarioId !== 'number' || !Number.isInteger(usuarioId)) {
        return res.status(400).json({
            success: false,
            message: 'El usuarioId debe ser un número entero'
        })
    }

    if (!servicioId) {
        return res.status(400).json({
            success: false,
            message: 'El servicioId es obligatorio'
        })
    }

    next()
}
