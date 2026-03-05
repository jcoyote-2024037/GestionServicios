'use strict'

export const tagValidator = (req, res, next) => {

    const {
        name
    } = req.body

    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El nombre es obligatorio'
        })
    }

    if (name.trim().length > 80) {
        return res.status(400).json({
            success: false,
            message: 'El nombre no puede exceder 80 caracteres'
        })
    }

    next()
}