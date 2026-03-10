'use strict'

import { Router } from "express"
import {
    createReview, getReviews, getReviewById,
    getReviewsByService, updateReview, deleteReview,
    moderateReview, likeReview
} from "./reviews.controller.js"
import { reviewsValidator, reviewsUpdateValidator } from "../../../middlewares/reviewsValidator.js"
import { validateJWT } from "../../../middlewares/validate_jwt.js"

const router = Router()

router.post('/create', validateJWT, reviewsValidator, createReview)
router.get('/', getReviews)
router.get('/:id', getReviewById)
router.get('/service/:servicioId', getReviewsByService)
router.put('/update/:id', validateJWT, reviewsUpdateValidator, updateReview)
router.delete('/delete/:id', validateJWT, deleteReview)
router.patch('/like/:id', validateJWT, likeReview)
router.patch('/moderate/:id', validateJWT, moderateReview)

export default router