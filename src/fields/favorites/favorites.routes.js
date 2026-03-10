'use strict'

import { Router } from "express"
import {
    createFavorite, getFavorites, getFavoriteById,
    getFavoritesByUser, countFavoritesByService,
    deleteFavorite, updateFavorite, getSuggestions
} from "./favorites.controller.js"
import { favoritesValidator, favoritesUpdateValidator } from "../../../middlewares/favoritesValidator.js"
import { validateJWT } from "../../../middlewares/validate_jwt.js"

const router = Router()

router.post('/create', validateJWT, favoritesValidator, createFavorite)
router.get('/', getFavorites)
router.get('/:id', getFavoriteById)
router.get('/user/:usuarioId', validateJWT, getFavoritesByUser)
router.get('/count/:servicioId', countFavoritesByService)
router.get('/suggestions/:usuarioId', validateJWT, getSuggestions)
router.put('/update/:id', validateJWT, favoritesUpdateValidator, updateFavorite)
router.delete('/delete/:id', validateJWT, deleteFavorite)

export default router