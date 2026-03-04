'use strict';
import { Router } from 'express';
import {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation
} from './location.controller.js';

const router = Router();

// crea una nueva location
router.post(
    '/', 
    createLocation
);

// obtiene todas las locations
router.get(
    '/', 
    getLocations
);

// obtiene una location por id
router.get(
    '/:id', 
    getLocation
);

// actualiza una location por id
router.put(
    '/:id', 
    updateLocation
);

// elimina una location por id (soft delete)
router.delete(
    '/:id', 
    deleteLocation
);

export default router;