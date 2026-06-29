'use strict'
import ActivityLog, { ALLOWED_ACTIONS, SEVERITY_LEVELS } from './logs_model.js'

// ---------------------------------------------------------------------------
// CONSTANTES DE DETECCION DE COMPORTAMIENTO SOSPECHOSO
// ---------------------------------------------------------------------------
const SUSPICIOUS_THRESHOLD_COUNT = 15   // cantidad de acciones
const SUSPICIOUS_THRESHOLD_MINUTES = 5  // en ese tiempo en minutos
const GROUP_WINDOW_SECONDS = 60          // ventana de agrupacion en segundos

// ---------------------------------------------------------------------------
// HELPERS INTERNOS
// ---------------------------------------------------------------------------

/**
 * Determina la severidad automatica de un log segun la accion.
 * Si el caller ya proporciona una severidad, esa tiene prioridad.
 */
const resolveSeverity = (action, overrideSeverity) => {
  if (overrideSeverity && SEVERITY_LEVELS.includes(overrideSeverity)) return overrideSeverity

  switch (action) {
    case 'DELETE':   return 'HIGH'
    case 'LOGIN':    return 'MEDIUM'
    case 'CREATE':   return 'LOW'
    case 'UPDATE':   return 'LOW'
    default:         return 'LOW'
  }
}

/**
 * Detecta si un usuario esta realizando demasiadas acciones en poco tiempo.
 * Si supera el umbral, registra un log CRITICAL automatico.
 * Esta funcion se llama de forma async sin await para no bloquear el flujo normal.
 */
const detectSuspiciousBehavior = async (userId) => {
  try {
    const windowStart = new Date(Date.now() - SUSPICIOUS_THRESHOLD_MINUTES * 60 * 1000)
    const recentCount = await ActivityLog.countDocuments({
      userId,
      createdAt: { $gte: windowStart },
      status: true
    })

    if (recentCount >= SUSPICIOUS_THRESHOLD_COUNT) {
      // Verificar que no se haya generado ya una alerta en esta ventana
      const alreadyFlagged = await ActivityLog.findOne({
        userId,
        action: 'UPDATE',
        affectedEntity: 'SYSTEM_ALERT',
        severity: 'CRITICAL',
        createdAt: { $gte: windowStart }
      })

      if (!alreadyFlagged) {
        await ActivityLog.create({
          userId,
          action: 'UPDATE',
          affectedEntity: 'SYSTEM_ALERT',
          detail: `Comportamiento sospechoso detectado: ${recentCount} acciones en ${SUSPICIOUS_THRESHOLD_MINUTES} minutos.`,
          severity: 'CRITICAL',
          immutable: true,
          metadata: { triggeredAt: new Date(), actionCount: recentCount, windowMinutes: SUSPICIOUS_THRESHOLD_MINUTES }
        })
      }
    }
  } catch (err) {
    console.error('Error en deteccion de comportamiento sospechoso:', err.message)
  }
}

// ---------------------------------------------------------------------------
// registerLog — FUNCION INTERNA
// ---------------------------------------------------------------------------
/**
 * Registra una accion en el historial. Se llama desde otros controllers o
 * desde el middleware automatico, no desde un endpoint directo.
 *
 * Parametros:
 *   userId          — ObjectId del usuario que realizo la accion
 *   action          — Una de: CREATE, UPDATE, DELETE, LOGIN, REVIEW_POSTED, SERVICE_REQUESTED
 *   affectedEntity  — Nombre de la entidad: 'Service', 'Review', etc.
 *   affectedEntityId — ID del documento afectado (opcional)
 *   detail          — Descripcion legible (opcional)
 *   ipAddress       — IP del cliente (opcional)
 *   userAgent       — User-Agent del cliente (opcional)
 *   requestId       — UUID de la request (opcional)
 *   metadata        — Objeto libre con info adicional, max 5kb (opcional)
 *   severity        — Nivel de severidad (opcional, se auto-calcula si no se envía)
 */
export const registerLog = async ({
  userId,
  action,
  affectedEntity,
  affectedEntityId = null,
  detail = '',
  ipAddress = null,
  userAgent = null,
  requestId = null,
  metadata = null,
  severity = null
}) => {
  try {
    // Validar action
    if (!ALLOWED_ACTIONS.includes(action)) {
      console.error(`registerLog: accion invalida "${action}". Permitidas: ${ALLOWED_ACTIONS.join(', ')}`)
      return
    }

    // Validar tamano de metadata (max 5kb)
    if (metadata !== null) {
      const metadataSize = Buffer.byteLength(JSON.stringify(metadata), 'utf8')
      if (metadataSize > 5120) {
        console.error('registerLog: metadata supera 5kb, se descarta.')
        metadata = { error: 'metadata descartada por superar 5kb' }
      }
    }

    const resolvedSeverity = resolveSeverity(action, severity)
    const isImmutable = resolvedSeverity === 'CRITICAL'

    // Agrupacion: buscar si existe un log identico en la ventana de agrupacion
    const windowStart = new Date(Date.now() - GROUP_WINDOW_SECONDS * 1000)
    const existingLog = await ActivityLog.findOne({
      userId,
      action,
      affectedEntity,
      affectedEntityId: affectedEntityId || null,
      status: true,
      createdAt: { $gte: windowStart }
    })

    if (existingLog && !existingLog.immutable) {
      // Incrementar contador en lugar de crear duplicado
      existingLog.count += 1
      existingLog.lastOccurrence = new Date()
      if (detail) existingLog.detail = detail
      await existingLog.save()
    } else {
      await ActivityLog.create({
        userId,
        action,
        affectedEntity,
        affectedEntityId,
        detail,
        ipAddress,
        userAgent,
        requestId,
        metadata,
        severity: resolvedSeverity,
        immutable: isImmutable,
        lastOccurrence: new Date()
      })
    }

    // Deteccion de comportamiento sospechoso (no bloqueante)
    detectSuspiciousBehavior(userId)

  } catch (error) {
    console.error('Error al registrar log:', error.message)
  }
}

// ---------------------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------------------

// GET /logs
// Devuelve logs con filtros y paginacion.
// Query params:
//   userId, action, affectedEntity, severity, dateFrom, dateTo, page, limit
export const getLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      affectedEntity,
      severity,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query

    const filter = { status: true }

    if (userId) filter.userId = userId
    if (action) {
      if (!ALLOWED_ACTIONS.includes(action)) {
        return res.status(400).json({ success: false, message: `action invalida. Permitidas: ${ALLOWED_ACTIONS.join(', ')}.` })
      }
      filter.action = action
    }
    if (affectedEntity) filter.affectedEntity = { $regex: affectedEntity, $options: 'i' }
    if (severity) {
      if (!SEVERITY_LEVELS.includes(severity)) {
        return res.status(400).json({ success: false, message: `severity invalida. Permitidas: ${SEVERITY_LEVELS.join(', ')}.` })
      }
      filter.severity = severity
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await ActivityLog.countDocuments(filter)
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: logs
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /logs/:id
// Devuelve un log especifico por ID.
export const getLog = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id).populate('userId', 'name email')
    if (!log || !log.status) {
      return res.status(404).json({ success: false, message: 'Log no encontrado.' })
    }
    res.status(200).json({ success: true, data: log })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /logs/timeline/:userId
// Devuelve todas las acciones de un usuario ordenadas cronologicamente.
// Util para reconstruir la actividad de un usuario en una linea de tiempo.
// Query: ?page=1 ?limit=50 ?dateFrom= ?dateTo=
export const getUserTimeline = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 50, dateFrom, dateTo } = req.query

    const filter = { userId, status: true }

    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await ActivityLog.countDocuments(filter)
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: 1 }) // ascendente para que sea una linea de tiempo real
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      userId,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: logs
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /logs/audit/report
// Devuelve solo los logs de severidad HIGH y CRITICAL.
// Pensado para el reporte de auditoria del sistema.
// Query: ?page=1 ?limit=20 ?dateFrom= ?dateTo=
export const getAuditReport = async (req, res) => {
  try {
    const { page = 1, limit = 20, dateFrom, dateTo } = req.query

    const filter = {
      status: true,
      severity: { $in: ['HIGH', 'CRITICAL'] }
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await ActivityLog.countDocuments(filter)
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: logs
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /logs/:id
// Soft delete de un log.
// BLOQUEA el borrado si el log tiene immutable=true.
export const deleteLog = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
    if (!log || !log.status) {
      return res.status(404).json({ success: false, message: 'Log no encontrado.' })
    }

    if (log.immutable) {
      return res.status(403).json({
        success: false,
        message: 'Este log es inmutable (severidad CRITICAL) y no puede ser eliminado. Es parte del registro de auditoria permanente.'
      })
    }

    log.status = false
    await log.save()

    res.status(200).json({ success: true, message: 'Log eliminado correctamente.' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}