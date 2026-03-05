'use strict'

export const servicesValidator = (req, res, next) => {

    const {
        nombre,
        descripcion,
        categoriaId,
        locationId,
        telefono,
        usuarioId
    } = req.body

    if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El nombre es obligatorio'
        })
    }

    if (!descripcion || descripcion.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'La descripción es obligatoria'
        })
    }

    if (!categoriaId) {
        return res.status(400).json({
            success: false,
            message: 'La categoría es obligatoria'
        })
    }

    if (!locationId) {
    return res.status(400).json({
        success: false,
        message: 'La ubicación es obligatoria'
    })
}

    if (!telefono || telefono.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El teléfono es obligatorio'
        })
    }

    if (!usuarioId) {
        return res.status(400).json({
            success: false,
            message: 'El usuario dueño es obligatorio'
        })
    }

    next()
}