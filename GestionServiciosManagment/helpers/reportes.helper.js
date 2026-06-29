'use strict'

import nodemailer from 'nodemailer'

export const etiquetaMotivo = (motivo) => {
    const etiquetas = {
        estafa:                 'Estafa',
        contenido_inapropiado:  'Contenido inapropiado',
        informacion_falsa:      'Información falsa',
        spam:                   'Spam',
        otro:                   'Otro'
    }
    return etiquetas[motivo] ?? motivo
}

export const etiquetaEstadoReporte = (estado) => {
    const etiquetas = {
        pendiente:    ' Pendiente',
        revisado:     ' Revisado',
        pending:      ' Pendiente',
        under_review: ' En revisión',
        resolved:     ' Resuelto',
        dismissed:    ' Desestimado'
    }
    return etiquetas[estado] ?? estado
}

export const etiquetaReportType = (type) => {
    const etiquetas = {
        fraude:          ' Fraude',
        contenido_falso: ' Contenido falso',
        spam:            ' Spam',
        abuso:           ' Abuso'
    }
    return etiquetas[type] ?? type
}

export const etiquetaSeverity = (severity) => {
    const etiquetas = {
        low:      '🟢 Baja',
        medium:   '🟡 Media',
        high:     '🟠 Alta',
        critical: '🔴 Crítica'
    }
    return etiquetas[severity] ?? severity
}

export const existeReportePendiente = async (Reporte, servicioId, usuarioId) => {
    const reporte = await Reporte.findOne({ servicioId, usuarioId, status: 'pending' })
    return !!reporte
}

/**
 * Verifica si el servicio supera el umbral de reportes y lo suspende automáticamente.
 * @param {object} Reporte  modelo Mongoose
 * @param {object} Service  modelo Mongoose
 * @param {string} servicioId
 * @returns {boolean} true si se suspendió
 */
export const verificarUmbralYSuspender = async (Reporte, Service, servicioId) => {
    const UMBRAL = Reporte.UMBRAL_SUSPENSION ?? 5
    const total = await Reporte.countDocuments({ servicioId, status: 'pending' })

    if (total >= UMBRAL) {
        await Service.findByIdAndUpdate(servicioId, { estado: 'inactivo' })
        return true
    }
    return false
}

/**
 * Notifica a los administradores sobre un reporte crítico o cuando se supera el umbral.
 * @param {string[]} adminEmails
 * @param {object} reporte
 * @param {string} [motivo]
 */
export const notificarAdmins = async (adminEmails, reporte, motivo = 'nuevo reporte') => {
    if (!adminEmails || adminEmails.length === 0) return

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        await transporter.sendMail({
            from: `"GestionServicios" <${process.env.EMAIL_USER}>`,
            to: adminEmails.join(', '),
            subject: `🚨 Alerta de reporte: ${motivo}`,
            html: `
                <h2>Nuevo reporte requiere atención</h2>
                <p><strong>Motivo de alerta:</strong> ${motivo}</p>
                <p><strong>Servicio ID:</strong> ${reporte.servicioId}</p>
                <p><strong>Tipo:</strong> ${etiquetaReportType(reporte.reportType)}</p>
                <p><strong>Severidad:</strong> ${etiquetaSeverity(reporte.severity)}</p>
                <p><strong>Descripción:</strong> ${reporte.descripcion}</p>
                <p>Ingresa al panel de administración para revisar el reporte.</p>
            `
        })
    } catch (error) {
        console.error('Error al notificar a admins:', error.message)
    }
}
