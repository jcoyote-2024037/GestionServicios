'use strict'

import Favorite from '../favorites/favorites.model.js'
import Service from '../services/services.model.js'

export const syncFavoritesCount = async (servicioId) => {

    const count = await Favorite.countDocuments({
        servicioId
    })

    await Service.findByIdAndUpdate(
        servicioId,
        {
            favoritosCount: count,
            lastActivityAt: new Date()
        }
    )

}