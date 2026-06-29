'use strict'

const DANGEROUS_CHARS_REGEX = /[<>"'`\\;{}()\[\]$|&!]/

export const tagValidator = (req, res, next) => {
    const { name } = req.body

    // Nombre obligatorio
    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El nombre de la etiqueta es obligatorio.'
        })
    }

    const trimmed = name.trim()

    // Máximo 30 caracteres
    if (trimmed.length > 30) {
        return res.status(400).json({
            success: false,
            message: 'El nombre no puede exceder 30 caracteres.'
        })
    }

    // Caracteres peligrosos
    if (DANGEROUS_CHARS_REGEX.test(trimmed)) {
        return res.status(400).json({
            success: false,
            message: 'El nombre contiene caracteres no permitidos.'
        })
    }

    next()
}