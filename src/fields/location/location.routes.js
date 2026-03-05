'use strict';
import { Router } from 'express';
import {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation
} from './location.controller.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

// obtiene todas las locations, acepta filtros ?municipality= y ?department=
router.get(
    '/', validateJWT, getLocations
);

// obtiene una location por id
router.get(
    '/:id', 
    validateJWT, 
    getLocation
);

// crea una nueva location (solo admin)
router.post(
    '/', validateJWT, 
    requireRole('ADMIN_ROLE'), 
    createLocation
);

// actualiza una location por id (solo admin)
router.put(
    '/:id', 
    validateJWT, 
    requireRole('ADMIN_ROLE'), 
    updateLocation
);

// elimina una location por id - soft delete (solo admin)
router.delete(
    '/:id', 
    validateJWT, 
    requireRole('ADMIN_ROLE'), 
    deleteLocation
);

export default router;