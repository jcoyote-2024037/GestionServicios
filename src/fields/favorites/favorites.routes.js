'use strict'

import { Router } from "express"
import {
    createFavorite,
    getFavorites,
    getFavoriteById,
    getFavoritesByUser,
    countFavoritesByService,
    deleteFavorite
} from "./favorites.controller.js"

import { favoritesValidator } from "../../../middlewares/favoritesValidator.js"

const router = Router()

router.post('/create', favoritesValidator, createFavorite)

router.get('/', getFavorites)

router.get('/:id', getFavoriteById)

router.get('/user/:usuarioId', getFavoritesByUser)

router.get('/count/:servicioId', countFavoritesByService)

router.delete('/delete/:id', deleteFavorite)

export default router
