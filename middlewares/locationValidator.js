'use strict'

export const locationValidator = (req, res, next) => {

    const {
        name,
        municipality,
        department
    } = req.body

    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El nombre es obligatorio'
        })
    }

    if (!municipality || municipality.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El municipio es obligatorio'
        })
    }

    if (!department || department.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El departamento es obligatorio'
        })
    }

    next()
}