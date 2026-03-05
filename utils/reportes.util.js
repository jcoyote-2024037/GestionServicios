'use strict'

import { etiquetaMotivo, etiquetaEstadoReporte } from '../helpers/reportes.helper.js'

/**
 * Formatea un reporte para las respuestas de la API.
 * @param {object} reporte  documento Mongoose
 * @returns {object}
 */
export const formatearReporte = (reporte) => {
    const obj = reporte.toObject ? reporte.toObject() : reporte

    return {
        id:             obj._id,
        servicio:       obj.servicioId,          // populate ya resuelto
        usuarioId:      obj.usuarioId,
        motivo:         obj.motivo,
        motivoLabel:    etiquetaMotivo(obj.motivo),
        descripcion:    obj.descripcion,
        estado:         obj.estado,
        estadoLabel:    etiquetaEstadoReporte(obj.estado),
        fecha:          obj.fecha,
        revision: obj.estado === 'revisado'
            ? {
                revisadoPor:   obj.revisadoPor,
                fechaRevision: obj.fechaRevision,
                nota:          obj.notaRevision
              }
            : null,
        creadoEn:       obj.createdAt,
        actualizadoEn:  obj.updatedAt
    }
}

/**
 * Resumen breve del reporte para listados.
 * @param {object} reporte
 * @returns {object}
 */
export const resumenReporte = (reporte) => {
    const obj = reporte.toObject ? reporte.toObject() : reporte

    return {
        id:          obj._id,
        servicioId:  obj.servicioId,
        usuarioId:   obj.usuarioId,
        motivo:      obj.motivo,
        motivoLabel: etiquetaMotivo(obj.motivo),
        estado:      obj.estado,
        estadoLabel: etiquetaEstadoReporte(obj.estado),
        fecha:       obj.fecha
    }
}
