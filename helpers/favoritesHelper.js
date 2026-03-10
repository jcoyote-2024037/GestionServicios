'use strict'

import Favorite from '../src/fields/favorites/favorites.model.js'
import Service from '../src/fields/services/services.model.js'

/** Cuenta los favoritos de un servicio y actualiza el campo favoritosCount en Service */
export const syncFavoritesCount = async (servicioId) => {
    const count = await Favorite.countDocuments({ servicioId })
    await Service.findByIdAndUpdate(servicioId, { favoritosCount: count })
}