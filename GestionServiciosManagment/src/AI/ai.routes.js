'use strict'
import { Router } from 'express'
import { chatWithAgent } from './ai.controller.js'
import { validateJWT } from '../../middlewares/validate_jwt.js'

const router = Router()

router.post('/chat', validateJWT, chatWithAgent)

export default router