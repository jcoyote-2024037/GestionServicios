'use strict'

const ESTADOS_REVISION = ['resolved', 'dismissed']

export const revisarReporteValidator = (req, res, next) => {
    const { nuevoStatus } = req.body

    if (nuevoStatus && !ESTADOS_REVISION.includes(nuevoStatus)) {
        return res.status(400).json({
            success: false,
            message: `nuevoStatus inválido. Valores permitidos: ${ESTADOS_REVISION.join(', ')}`
        })
    }

    next()
}
const REPORT_TYPES      = ['fraude', 'contenido_falso', 'spam', 'abuso']
const SEVERITIES        = ['low', 'medium', 'high', 'critical']

export const reportesValidator = (req, res, next) => {
    const { servicioId, motivo, reportType, descripcion, severity } = req.body

    if (!servicioId || servicioId.toString().trim().length === 0) {
        return res.status(400).json({ success: false, message: 'El servicioId es obligatorio' })
    }

    if (!motivo || !MOTIVOS_VALIDOS.includes(motivo)) {
        return res.status(400).json({
            success: false,
            message: `El motivo es obligatorio. Valores permitidos: ${MOTIVOS_VALIDOS.join(', ')}`
        })
    }

    if (!reportType || !REPORT_TYPES.includes(reportType)) {
        return res.status(400).json({
            success: false,
            message: `El reportType es obligatorio. Valores permitidos: ${REPORT_TYPES.join(', ')}`
        })
    }

    if (!descripcion || descripcion.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'La descripción es obligatoria' })
    }

    if (descripcion.trim().length > 1000) {
        return res.status(400).json({ success: false, message: 'La descripción no puede superar los 1000 caracteres' })
    }

    if (severity && !SEVERITIES.includes(severity)) {
        return res.status(400).json({
            success: false,
            message: `Severidad inválida. Valores permitidos: ${SEVERITIES.join(', ')}`
        })
    }

    next()
}
