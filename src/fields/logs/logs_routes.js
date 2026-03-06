'use strict'
import { Router } from 'express'
import { getLogs, getLog, deleteLog } from './logs_controller.js'
import { validateJWT } from '../../../middlewares/validate_jwt.js'
import { requireRole } from '../../../middlewares/validate_role.js'
import { logQueryValidator } from '../../../middlewares/activityLogValidator.js'

const router = Router()

// obtener todos los logs con filtros ?userId= ?action= ?affectedEntity= ?page= ?limit=
router.get('/', validateJWT, requireRole('ADMIN_ROLE'), logQueryValidator, getLogs)

// obtener un log por id
router.get('/:id', validateJWT, requireRole('ADMIN_ROLE'), getLog)

// soft delete log (solo admin)
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteLog)

export default router