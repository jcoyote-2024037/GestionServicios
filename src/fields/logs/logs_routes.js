'use strict'
import { Router } from 'express'
import { getLogs, getLog, deleteLog, getUserTimeline, getAuditReport } from './logs_controller.js'
import { validateJWT } from '../../../middlewares/validate_jwt.js'
import { requireRole } from '../../../middlewares/validate_role.js'
import { logQueryValidator } from '../../../middlewares/activityLogValidator.js'

const router = Router()

// Todas las rutas de logs requieren JWT y rol ADMIN

// GET /logs/audit/report
// Reporte de auditoria: solo logs HIGH y CRITICAL
// IMPORTANTE: debe ir antes de /:id para no confundir el parametro
router.get('/audit/report', validateJWT, requireRole('ADMIN_ROLE'), getAuditReport)

// GET /logs/timeline/:userId
// Linea de tiempo de acciones de un usuario especifico
router.get('/timeline/:userId', validateJWT, requireRole('ADMIN_ROLE'), getUserTimeline)

// GET /logs
// Lista todos los logs con filtros y paginacion
// Query: ?userId= ?action= ?affectedEntity= ?severity= ?dateFrom= ?dateTo= ?page= ?limit=
router.get('/', validateJWT, requireRole('ADMIN_ROLE'), logQueryValidator, getLogs)

// GET /logs/:id
// Detalle de un log por ID
router.get('/:id', validateJWT, requireRole('ADMIN_ROLE'), getLog)

// DELETE /logs/:id
// Soft delete. Bloqueado si el log es inmutable (CRITICAL)
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteLog)

export default router