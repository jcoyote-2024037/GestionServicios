'use strict'

import { Router } from "express"

import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getActiveCategories
} from "./categories.controller.js"

import { categoriesValidator } from "../../../middlewares/categoriesValidator.js"

const router = Router()

router.post('/create', categoriesValidator, createCategory)

router.get('/', getCategories)

router.get('/:id', getCategoryById)

router.get('/active', getActiveCategories)

router.put('/update/:id', categoriesValidator, updateCategory)

router.delete('/delete/:id', deleteCategory)

export default router