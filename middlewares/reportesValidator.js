'use strict'

const MOTIVOS_VALIDOS = [
    'estafa',
    'contenido_inapropiado',
    'informacion_falsa',
    'spam',
    'otro'
]

export const reportesValidator = (req, res, next) => {
    const { servicioId, motivo, descripcion } = req.body

    if (!servicioId || servicioId.toString().trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El servicioId es obligatorio'
        })
    }

    if (!motivo || motivo.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El motivo es obligatorio'
        })
    }

    if (!MOTIVOS_VALIDOS.includes(motivo)) {
        return res.status(400).json({
            success: false,
            message: `Motivo inválido. Los motivos permitidos son: ${MOTIVOS_VALIDOS.join(', ')}`
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
