'use strict'

import { etiquetaEstado } from '../helpers/solicitudes.helper.js'

export const formatearSolicitud = (solicitud) => {
    const obj = solicitud.toObject ? solicitud.toObject() : solicitud

    return {
        id:              obj._id,
        usuarioId:       obj.usuarioId,
        proveedorId:     obj.proveedorId ?? null,
        servicio:        obj.servicioId,
        descripcion:     obj.descripcion,
        status:          obj.status,
        statusLabel:     etiquetaEstado(obj.status),
        priceEstimate:   obj.priceEstimate ?? null,
        scheduledDate:   obj.scheduledDate ?? null,
        acceptedAt:      obj.acceptedAt ?? null,
        completedAt:     obj.completedAt ?? null,
        cancelReason:    obj.cancelReason ?? null,
        chatEnabled:     obj.chatEnabled ?? false,
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

export const resumenSolicitud = (solicitud) => {
    const obj = solicitud.toObject ? solicitud.toObject() : solicitud

    return {
        id:             obj._id,
        usuarioId:      obj.usuarioId,
        servicioId:     obj.servicioId,
        status:         obj.status,
        statusLabel:    etiquetaEstado(obj.status),
        scheduledDate:  obj.scheduledDate ?? null,
        fechaSolicitud: obj.fechaSolicitud
    }
}
