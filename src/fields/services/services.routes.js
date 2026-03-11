'use strict'

import { Router } from "express"
import {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
} from "./services.controller.js"

import { servicesValidator } from "../../../middlewares/servicesValidator.js"
import { validateJWT } from "../../../middlewares/validate_jwt.js"
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router()

router.post('/create', validateJWT, servicesValidator, createService)

router.get('/', getServices)

router.get('/:id', validateJWT,getServiceById)

router.put('/update/:id', validateJWT, requireRole('ADMIN_ROLE'),servicesValidator, updateService)

router.delete('/delete/:id',validateJWT, deleteService)

export default router