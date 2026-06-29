'use strict'

import {
    etiquetaMotivo,
    etiquetaEstadoReporte,
    etiquetaReportType,
    etiquetaSeverity
} from '../helpers/reportes.helper.js'

export const formatearReporte = (reporte) => {
    const obj = reporte.toObject ? reporte.toObject() : reporte

    return {
        id:              obj._id,
        servicio:        obj.servicioId,
        usuarioId:       obj.usuarioId,
        motivo:          obj.motivo,
        motivoLabel:     etiquetaMotivo(obj.motivo),
        reportType:      obj.reportType,
        reportTypeLabel: etiquetaReportType(obj.reportType),
        descripcion:     obj.descripcion,
        severity:        obj.severity,
        severityLabel:   etiquetaSeverity(obj.severity),
        status:          obj.status,
        statusLabel:     etiquetaEstadoReporte(obj.status),
        resolution:      obj.resolution ?? null,
        fecha:           obj.fecha,
        revision: ['resolved', 'dismissed'].includes(obj.status)
            ? {
                reviewedBy:    obj.reviewedBy,
                reviewedAt:    obj.reviewedAt,
                resolution:    obj.resolution,
                nota:          obj.notaRevision
              }
            : null,
        creadoEn:        obj.createdAt,
        actualizadoEn:   obj.updatedAt
    }
}

export const resumenReporte = (reporte) => {
    const obj = reporte.toObject ? reporte.toObject() : reporte

    return {
        id:              obj._id,
        servicioId:      obj.servicioId,
        usuarioId:       obj.usuarioId,
        motivo:          obj.motivo,
        motivoLabel:     etiquetaMotivo(obj.motivo),
        reportType:      obj.reportType,
        severity:        obj.severity,
        status:          obj.status,
        statusLabel:     etiquetaEstadoReporte(obj.status),
        fecha:           obj.fecha
    }
}
