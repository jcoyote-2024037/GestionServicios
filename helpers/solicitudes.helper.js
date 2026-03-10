'use strict'

import nodemailer from 'nodemailer'

/*
  Matriz de transiciones de estado permitidas según el rol:

  USER_ROLE     → puede cancelar su solicitud (pending → cancelled)
  PROVEEDOR_ID  → solo el proveedor del servicio puede aceptar/rechazar/completar
  ADMIN_ROLE    → puede mover a cualquier estado válido

  Estados terminales: rejected, completed, cancelled, expired
*/

// Transiciones permitidas por rol
const TRANSICIONES_ADMIN = {
    pending:    ['accepted', 'rejected', 'cancelled', 'expired'],
    accepted:   ['completed', 'rejected', 'cancelled'],
    rejected:   [],
    completed:  [],
    cancelled:  [],
    expired:    []
}

// Solo el proveedor puede aceptar, rechazar o completar
const TRANSICIONES_PROVEEDOR = {
    pending:    ['accepted', 'rejected'],
    accepted:   ['completed', 'rejected'],
    rejected:   [],
    completed:  [],
    cancelled:  [],
    expired:    []
}

const TRANSICIONES_USER = {
    pending:    ['cancelled'],
    accepted:   ['cancelled'],
    rejected:   [],
    completed:  [],
    cancelled:  [],
    expired:    []
}

/**
 * Valida si la transición de estado es permitida.
 * @param {string} estadoActual
 * @param {string} nuevoEstado
 * @param {string} rol          'ADMIN_ROLE' | 'USER_ROLE'
 * @param {boolean} esProveedor  true si el usuario es el proveedor del servicio
 * @returns {string|null}  mensaje de error o null si es válido
 */
export const estadosPermitidos = (estadoActual, nuevoEstado, rol, esProveedor = false) => {
    let transiciones

    if (rol === 'ADMIN_ROLE') {
        transiciones = TRANSICIONES_ADMIN
    } else if (esProveedor) {
        transiciones = TRANSICIONES_PROVEEDOR
    } else {
        transiciones = TRANSICIONES_USER
    }

    const permitidos = transiciones[estadoActual] ?? []

    if (permitidos.length === 0) {
        return `La solicitud se encuentra en estado "${estadoActual}" y ya no puede ser modificada`
    }

    if (!permitidos.includes(nuevoEstado)) {
        return `No se puede cambiar de "${estadoActual}" a "${nuevoEstado}". Transiciones permitidas: ${permitidos.join(', ')}`
    }

    return null
}

/**
 * Retorna una etiqueta legible del estado.
 * @param {string} estado
 * @returns {string}
 */
export const etiquetaEstado = (estado) => {
    const etiquetas = {
        pending:    '⏳ Pendiente',
        accepted:   '✅ Aceptado',
        rejected:   '❌ Rechazado',
        completed:  '🏁 Completado',
        cancelled:  '🚫 Cancelado',
        expired:    '⌛ Expirado',
        // legacy
        pendiente:  '⏳ Pendiente',
        aceptado:   '✅ Aceptado',
        rechazado:  '❌ Rechazado',
        completado: '🏁 Completado'
    }
    return etiquetas[estado] ?? estado
}

/**
 * Notifica al proveedor que hay una nueva solicitud para su servicio.
 * @param {string} emailProveedor
 * @param {object} solicitud  datos básicos de la solicitud
 */
export const notificarProveedor = async (emailProveedor, solicitud) => {
    if (!emailProveedor) return

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
            to: emailProveedor,
            subject: '📬 Nueva solicitud para tu servicio',
            html: `
                <h2>Tienes una nueva solicitud</h2>
                <p><strong>Servicio:</strong> ${solicitud.nombreServicio}</p>
                <p><strong>Descripción:</strong> ${solicitud.descripcion}</p>
                ${solicitud.scheduledDate ? `<p><strong>Fecha solicitada:</strong> ${new Date(solicitud.scheduledDate).toLocaleString('es-GT')}</p>` : ''}
                ${solicitud.priceEstimate ? `<p><strong>Presupuesto estimado:</strong> Q${solicitud.priceEstimate}</p>` : ''}
                <p>Ingresa a la plataforma para aceptar o rechazar la solicitud.</p>
            `
        })
    } catch (error) {
        console.error('Error al notificar al proveedor:', error.message)
    }
}

/**
 * Marca como "expired" todas las solicitudes pending cuya scheduledDate ya pasó.
 * Debe llamarse desde un cron job o al arrancar el servidor.
 * @param {object} Solicitud  modelo Mongoose
 * @returns {number} cantidad de solicitudes expiradas
 */
export const expirarSolicitudesPendientes = async (Solicitud) => {
    const ahora = new Date()

    const result = await Solicitud.updateMany(
        {
            status: 'pending',
            scheduledDate: { $lt: ahora, $ne: null }
        },
        {
            $set: { status: 'expired', estado: 'rechazado' },
            $push: {
                historialEstados: {
                    estado: 'expired',
                    cambiadoPor: 0,  // 0 = sistema
                    fecha: ahora,
                    observacion: 'Expirada automáticamente por fecha programada vencida'
                }
            }
        }
    )

    return result.modifiedCount
}
