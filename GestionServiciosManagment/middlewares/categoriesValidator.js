'use strict'

export const categoriesValidator = (req, res, next) => {

    const { nombre } = req.body

    if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El nombre de la categoría es obligatorio'
        })
    }

    if (nombre.length > 80) {
        return res.status(400).json({
            success: false,
            message: 'El nombre no puede superar los 80 caracteres'
        })
    }

    next()
}