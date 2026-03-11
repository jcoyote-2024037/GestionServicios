'use strict'

import Review from '../src/fields/reviews/reviews.model.js'
import Service from '../src/fields/services/services.model.js'

export const updateServiceAverage = async (servicioId) => {

    const reviews = await Review.find({
        servicioId,
        status: 'published'
    })

    const reviewsCount = reviews.length

    const totalRating = reviews.reduce((acc, r) => acc + r.calificacion, 0)

    const averageRating = reviewsCount === 0
        ? 0
        : totalRating / reviewsCount

    await Service.findByIdAndUpdate(
        servicioId,
        {
            reviewsCount,
            averageRating,
            lastActivityAt: new Date()
        }
    )

}