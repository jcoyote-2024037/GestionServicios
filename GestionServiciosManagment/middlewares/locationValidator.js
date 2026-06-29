'use strict'

const POSTAL_CODE_REGEX = /^\d{4,10}$/

export const locationValidator = (req, res, next) => {
    const { name, municipality, department, lat, lng, postalCode } = req.body

    // Campos obligatorios
    if (!name || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El nombre es obligatorio.'
        })
    }

    if (!municipality || municipality.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El municipio es obligatorio.'
        })
    }

    if (!department || department.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El departamento es obligatorio.'
        })
    }

    // Validación de coordenadas
    if (lat !== undefined) {
        const latNum = Number(lat)
        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            return res.status(400).json({
                success: false,
                message: 'La latitud debe ser un número entre -90 y 90.'
            })
        }
    }

    if (lng !== undefined) {
        const lngNum = Number(lng)
        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            return res.status(400).json({
                success: false,
                message: 'La longitud debe ser un número entre -180 y 180.'
            })
        }
    }

    // Si mandan uno, deben mandar el otro
    if ((lat !== undefined && lng === undefined) || (lat === undefined && lng !== undefined)) {
        return res.status(400).json({
            success: false,
            message: 'Si se proporcionan coordenadas, se requieren tanto latitud como longitud.'
        })
    }

    // Validación de código postal
    if (postalCode !== undefined && postalCode !== '') {
        if (!POSTAL_CODE_REGEX.test(postalCode.toString().trim())) {
            return res.status(400).json({
                success: false,
                message: 'El código postal debe contener entre 4 y 10 dígitos numéricos.'
            })
        }
    }

    next()
}