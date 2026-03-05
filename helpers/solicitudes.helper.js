'use strict'

/*
  Matriz de transiciones de estado permitidas según el rol:

  USER_ROLE  → puede cancelar una solicitud (pendiente → rechazado)
  ADMIN_ROLE → puede mover a cualquier estado válido desde cualquier estado

  Reglas de negocio:
  - Una solicitud "completado" o "rechazado" es estado terminal: nadie puede cambiarla
  - El usuario solo puede rechazar (cancelar) una solicitud propia en estado pendiente
  - El admin puede aceptar, rechazar y completar
*/

const TRANSICIONES_ADMIN = {
    pendiente:  ['aceptado', 'rechazado'],
    aceptado:   ['completado', 'rechazado'],
    rechazado:  [],   // terminal
    completado: []    // terminal
}

const TRANSICIONES_USER = {
    pendiente:  ['rechazado'], // el usuario puede cancelar
    aceptado:   [],
    rechazado:  [],
    completado: []
}

/**
 * Valida si la transición de estado es permitida para el rol dado.
 * @param {string} estadoActual
 * @param {string} nuevoEstado
 * @param {string} rol  'ADMIN_ROLE' | 'USER_ROLE'
 * @returns {string|null}  mensaje de error o null si es válido
 */
export const estadosPermitidos = (estadoActual, nuevoEstado, rol) => {
    const transiciones =
        rol === 'ADMIN_ROLE'
            ? TRANSICIONES_ADMIN
            : TRANSICIONES_USER

    const permitidos = transiciones[estadoActual] ?? []

    if (permitidos.length === 0) {
        return `La solicitud se encuentra en estado "${estadoActual}" y ya no puede ser modificada`
    }

    if (!permitidos.includes(nuevoEstado)) {
        return `No se puede cambiar de "${estadoActual}" a "${nuevoEstado}". Transiciones permitidas: ${permitidos.join(', ')}`
    }

    return null // sin error → transición válida
}

/**
 * Retorna una etiqueta legible del estado.
 * @param {string} estado
 * @returns {string}
 */
export const etiquetaEstado = (estado) => {
    const etiquetas = {
        pendiente:  '⏳ Pendiente',
        aceptado:   '✅ Aceptado',
        rechazado:  '❌ Rechazado',
        completado: '🏁 Completado'
    }
    return etiquetas[estado] ?? estado
}
