'use strict'

import { Router } from 'express'
import { initChat, sendMessage, getMessages, getMyChats } from './chat.controller.js'
import { validateJWT } from '../../../middlewares/validate_jwt.js'

const router = Router()
router.use(validateJWT)

router.post('/init/:solicitudId', initChat)
router.post('/:roomId/message', sendMessage)
router.get('/:roomId/messages', getMessages)
router.get('/', getMyChats)

export default router
