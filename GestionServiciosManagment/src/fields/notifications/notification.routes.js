'use strict'

import { Router } from 'express'
import {
    getNotifications,
    marcarComoLeida,
    marcarTodasComoLeidas,
    contarNoLeidas
} from './notification.controller.js'
import { validateJWT } from '../../../middlewares/validate_jwt.js'

const router = Router()
router.use(validateJWT)

router.get('/', getNotifications)
router.get('/count', contarNoLeidas)
router.patch('/:id/read', marcarComoLeida)
router.patch('/read-all', marcarTodasComoLeidas)

export default router
