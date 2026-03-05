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

const router = Router()

router.post('/create', servicesValidator, createService)

router.get('/', getServices)

router.get('/:id', getServiceById)

router.put('/update/:id', servicesValidator, updateService)

router.delete('/delete/:id', deleteService)

export default router