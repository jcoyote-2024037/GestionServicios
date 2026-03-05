'use strict'

import { etiquetaEstado } from '../helpers/solicitudes.helper.js'

/**
 * Formatea una solicitud para las respuestas de la API.
 * Limpia campos internos de Mongoose y agrega etiquetas legibles.
 * @param {object} solicitud  documento Mongoose
 * @returns {object}
 */
export const formatearSolicitud = (solicitud) => {
    const obj = solicitud.toObject ? solicitud.toObject() : solicitud

    return {
        id:              obj._id,
        usuarioId:       obj.usuarioId,
        servicio:        obj.servicioId,          // populate ya resuelto
        descripcion:     obj.descripcion,
        estado:          obj.estado,
        estadoLabel:     etiquetaEstado(obj.estado),
        fechaSolicitud:  obj.fechaSolicitud,
        historial:       (obj.historialEstados ?? []).map((h) => ({
            estado:       h.estado,
            estadoLabel:  etiquetaEstado(h.estado),
            cambiadoPor:  h.cambiadoPor,
            fecha:        h.fecha,
            observacion:  h.observacion ?? ''
        })),
        creadoEn:        obj.createdAt,
        actualizadoEn:   obj.updatedAt
    }
}

/**
 * Construye un resumen breve de la solicitud (para listas).
 * @param {object} solicitud
 * @returns {object}
 */
export const resumenSolicitud = (solicitud) => {
    const obj = solicitud.toObject ? solicitud.toObject() : solicitud

    return {
        id:             obj._id,
        usuarioId:      obj.usuarioId,
        servicioId:     obj.servicioId,
        estado:         obj.estado,
        estadoLabel:    etiquetaEstado(obj.estado),
        fechaSolicitud: obj.fechaSolicitud
    }
}
