'use strict'
import { Router } from 'express'
import { chatWithAgent } from './ai.controller.js'

const router = Router()

router.post('/chat', chatWithAgent)

export default router