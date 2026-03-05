'use strict'

/**
 * Retorna una etiqueta legible del motivo del reporte.
 * @param {string} motivo
 * @returns {string}
 */
export const etiquetaMotivo = (motivo) => {
    const etiquetas = {
        estafa:                 '🚨 Estafa',
        contenido_inapropiado:  '⚠️ Contenido inapropiado',
        informacion_falsa:      '❗ Información falsa',
        spam:                   '📧 Spam',
        otro:                   '📌 Otro'
    }
    return etiquetas[motivo] ?? motivo
}

/**
 * Retorna una etiqueta legible del estado del reporte.
 * @param {string} estado
 * @returns {string}
 */
export const etiquetaEstadoReporte = (estado) => {
    const etiquetas = {
        pendiente: '⏳ Pendiente',
        revisado:  '✔️ Revisado'
    }
    return etiquetas[estado] ?? estado
}

/**
 * Verifica si un reporte ya existe para el mismo usuario y servicio en estado pendiente.
 * Útil para validaciones extra fuera del controller.
 * @param {object} Reporte  modelo Mongoose
 * @param {string} servicioId
 * @param {number} usuarioId
 * @returns {Promise<boolean>}
 */
export const existeReportePendiente = async (Reporte, servicioId, usuarioId) => {
    const reporte = await Reporte.findOne({ servicioId, usuarioId, estado: 'pendiente' })
    return !!reporte
}
