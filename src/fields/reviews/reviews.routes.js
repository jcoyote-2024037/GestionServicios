'use strict'

import { Router } from "express"
import {
    createReview,
    getReviews,
    getReviewById,
    getReviewsByService,
    updateReview,
    deleteReview
} from "./reviews.controller.js"

import { reviewsValidator, reviewsUpdateValidator } from "../../../middlewares/reviewsValidator.js"

const router = Router()

router.post('/create', reviewsValidator, createReview)

router.get('/', getReviews)

router.get('/:id', getReviewById)

router.get('/service/:servicioId', getReviewsByService)

router.put('/update/:id', reviewsUpdateValidator, updateReview)

router.delete('/delete/:id', deleteReview)

export default router
